import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {

  const body = await req.text();

  const signature = req.headers.get("x-razorpay-signature")!;

  const secret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET")!;

  const expectedSignature = createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (expectedSignature !== signature) {
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(body);

  if (event.event === "payment.captured") {

    const payment = event.payload.payment.entity;

    const orderId = payment.notes?.order_id;

    console.log("Payment captured:", payment.id);

    // Here you update your order in database
  }

  return new Response("Webhook received", {
    headers: corsHeaders,
  });

});