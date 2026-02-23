import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TICKET_PRICES: Record<string, string> = {
  general: "price_1T48UrDpYIyW3XDRYMdeBJrk",
  vip: "price_1T48V4DpYIyW3XDRT7n3xtQj",
  parking: "price_1T48VFDpYIyW3XDRLLhHtVTM",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { items, donationAmount } = await req.json();

    // items: { general: number, vip: number, parking: number }
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const [type, qty] of Object.entries(items)) {
      const quantity = Number(qty);
      if (quantity > 0 && TICKET_PRICES[type]) {
        lineItems.push({ price: TICKET_PRICES[type], quantity });
      }
    }

    if (lineItems.length === 0) {
      throw new Error("Please select at least one ticket or parking pass");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Add optional monthly donation as a subscription-mode isn't possible
    // in mixed mode, so we add it as a one-time donation line item
    if (donationAmount && Number(donationAmount) >= 1) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: `CB Extravaganza Donation`,
            description: "One-time donation to the CBHS Tuition Assistance Fund",
          },
          unit_amount: Number(donationAmount) * 100,
        },
        quantity: 1,
      });
    }

    const origin = req.headers.get("origin") || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/donation-success?type=tickets`,
      cancel_url: `${origin}/`,
      payment_method_types: ["card", "us_bank_account"],
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
