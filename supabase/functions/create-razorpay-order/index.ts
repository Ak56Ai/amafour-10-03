// supabase/functions/create-razorpay-order/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Razorpay from "https://esm.sh/razorpay@2.9.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const {
      cartItems,
      userId,
      addressId,
      shippingMethod,
      idempotencyKey,
      timestamp
    } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // ✅ REPLAY PROTECTION: Check if this idempotency key was used
    const { data: existingRequest } = await supabaseClient
      .from('payment_idempotency')
      .select('*')
      .eq('idempotency_key', idempotencyKey)
      .single();

    if (existingRequest) {
      console.log('Replay attempt detected for key:', idempotencyKey);

      // If within 24 hours and same request, return existing response
      const timeDiff = Date.now() - new Date(existingRequest.created_at).getTime();
      if (timeDiff < 24 * 60 * 60 * 1000) {
        return new Response(
          JSON.stringify(existingRequest.response_data),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
    }

    // Calculate total from database (secure)
    let total = 0;
    const orderItems = [];
    
    for (const item of cartItems) {
      const { data: variant, error } = await supabaseClient
        .from('product_variants')
        .select(`
          id,
          product_id,
          sku,
          pricing:product_pricing(effective_price)
        `)
        .eq('id', item.variant_id)
        .single();

      if (error || !variant) {
        throw new Error(`Invalid variant: ${item.variant_id}`);
      }

      const price = variant.pricing?.[0]?.effective_price || item.price;
      total += price * item.quantity;
      orderItems.push({
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: price,
        sku: variant.sku
      });
    }

    const shippingCost = total > 500 ? 0 : 40;
    const finalAmount = total + shippingCost;

    // Generate unique order reference
    const orderReference = `ORD_${Date.now()}_${userId.slice(0, 8)}_${Math.random().toString(36).substr(2, 6)}`;

    // Create Razorpay order
    const razorpay = new Razorpay({
      key_id: Deno.env.get("RAZORPAY_KEY_ID")!,
      key_secret: Deno.env.get("RAZORPAY_KEY_SECRET")!,
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: finalAmount * 100,
      currency: "INR",
      receipt: orderReference,
      notes: {
        userId,
        addressId,
        shippingMethod,
        idempotencyKey,
        orderItems: JSON.stringify(orderItems)
      }
    });

    // Store pending order
    const { error: insertError } = await supabaseClient
      .from('pending_orders')
      .insert({
        order_reference: orderReference,
        razorpay_order_id: razorpayOrder.id,
        user_id: userId,
        address_id: addressId,
        cart_items: orderItems,
        total_amount: finalAmount,
        shipping_cost: shippingCost,
        payment_method: 'razorpay',
        status: 'pending_payment',
        idempotency_key: idempotencyKey,
        expires_at: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
      });

    if (insertError) throw insertError;

    // Store idempotency record
    const responseData = {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      orderReference,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    };

    await supabaseClient
      .from('payment_idempotency')
      .insert({
        idempotency_key: idempotencyKey,
        request_hash: JSON.stringify({ cartItems, userId, addressId }), 
        response_data: responseData,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });

    return new Response(
      JSON.stringify(responseData),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error('[Create Razorpay Order] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
