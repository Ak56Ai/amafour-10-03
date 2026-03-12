import Razorpay from "npm:razorpay";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // handle preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { amount, receipt } = await req.json();

    // Log environment variables for debugging (remove in production)
    console.log("RAZORPAY_KEY_ID exists:", !!Deno.env.get("RAZORPAY_KEY_ID"));
    console.log("RAZORPAY_KEY_SECRET exists:", !!Deno.env.get("RAZORPAY_KEY_SECRET"));

    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!keyId || !keySecret) {
      throw new Error("Razorpay credentials not found in environment variables");
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    console.log("Creating Razorpay order with amount:", amount, "receipt:", receipt);

    const order = await razorpay.orders.create({
      amount: parseInt(amount),
      currency: "INR",
      receipt: receipt.toString()
    });

    console.log("Razorpay order created successfully:", order.id);

    return new Response(
      JSON.stringify(order),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        }
      }
    );

  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.description || "Unknown error"
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        }
      }
    );
  }
});