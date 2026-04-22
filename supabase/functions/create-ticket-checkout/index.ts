import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { items, donationAmount, phone, sms_opt_in, sms_opt_in_url } = await req.json();
    // items: { general: number, vip: number, parking: number }
    const optedIn = sms_opt_in !== false;

    // Fetch inventory to get stripe price IDs and check availability
    const { data: inventory, error: invError } = await supabaseAdmin
      .from("ticket_inventory")
      .select("*")
      .eq("is_active", true);

    if (invError) throw new Error("Failed to load inventory");

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let totalCents = 0;

    for (const [type, qty] of Object.entries(items)) {
      const quantity = Number(qty);
      if (quantity <= 0) continue;

      const inv = inventory?.find((i: any) => i.ticket_type === type);
      if (!inv) throw new Error(`Unknown ticket type: ${type}`);
      if (inv.remaining_available < quantity) {
        throw new Error(`Only ${inv.remaining_available} ${inv.label} tickets remaining`);
      }

      lineItems.push({ price: inv.stripe_price_id, quantity });
      totalCents += inv.price_cents * quantity;
    }

    if (lineItems.length === 0) {
      throw new Error("Please select at least one ticket or parking pass");
    }

    const donAmt = Number(donationAmount) || 0;
    if (donAmt >= 1) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "CB Extravaganza Donation",
            description: "One-time donation to the CBHS Tuition Assistance Fund",
          },
          unit_amount: donAmt * 100,
        },
        quantity: 1,
      });
      totalCents += donAmt * 100;
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const origin = req.headers.get("origin") || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/donation-success?type=tickets`,
      cancel_url: `${origin}/`,
      payment_method_types: ["card", "us_bank_account"],
    });

    // Record the purchase
    await supabaseAdmin.from("ticket_purchases").insert({
      stripe_session_id: session.id,
      general_qty: Number(items.general) || 0,
      vip_qty: Number(items.vip) || 0,
      parking_qty: Number(items.parking) || 0,
      donation_amount: donAmt,
      total_cents: totalCents,
      payment_status: "pending",
      phone: phone || null,
      sms_opt_in: optedIn,
      sms_opt_in_at: optedIn ? new Date().toISOString() : null,
      sms_opt_in_source: optedIn ? (sms_opt_in_url || "ticket_purchase") : null,
    });

    // Decrement inventory
    for (const [type, qty] of Object.entries(items)) {
      const quantity = Number(qty);
      if (quantity <= 0) continue;
      const inv = inventory?.find((i: any) => i.ticket_type === type);
      if (inv) {
        await supabaseAdmin
          .from("ticket_inventory")
          .update({ remaining_available: inv.remaining_available - quantity })
          .eq("ticket_type", type);
      }
    }

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
