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
    const { sponsorship_level_id, company_name, contact_name, email, phone, address_line1, address_line2, city, state, zip, preferred_venue, notes } = await req.json();

    if (!sponsorship_level_id || !company_name || !contact_name || !email) {
      throw new Error("Missing required fields");
    }

    // Look up the sponsorship level
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { data: level, error: levelError } = await supabaseClient
      .from("sponsorship_levels")
      .select("*")
      .eq("id", sponsorship_level_id)
      .single();

    if (levelError || !level) throw new Error("Sponsorship level not found");
    if (level.remaining_available <= 0) throw new Error("This sponsorship level is sold out");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const origin = req.headers.get("origin") || "http://localhost:5173";

    // Create a one-time payment checkout session supporting card + ACH
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "us_bank_account"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `CB Extravaganza - ${level.name}`,
              description: `Sponsorship: ${level.name} ($${Number(level.amount).toLocaleString()})`,
            },
            unit_amount: Math.round(Number(level.amount) * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/sponsors?success=true`,
      cancel_url: `${origin}/sponsors?canceled=true`,
      metadata: {
        sponsorship_level_id,
        sponsorship_level_name: level.name,
        company_name,
        contact_name,
        email,
        phone: phone || "",
      },
      customer_email: email,
      payment_intent_data: {
        metadata: {
          sponsorship_level_id,
          company_name,
          contact_name,
        },
      },
    });

    // Insert sponsor record
    const { error: insertError } = await supabaseClient.from("sponsors").insert({
      company_name,
      contact_name,
      email,
      phone: phone || null,
      address_line1: address_line1 || null,
      address_line2: address_line2 || null,
      city: city || null,
      state: state || null,
      zip: zip || null,
      sponsorship_level: level.name,
      value: level.amount,
      ticket_qty: level.tickets_included,
      parking_qty: level.parking_included,
      payment_status: "Pending",
      status: "Form Received",
      notes: [preferred_venue ? `Preferred venue: ${preferred_venue}` : "", notes || ""].filter(Boolean).join(". ") || null,
    });

    if (insertError) {
      console.error("Sponsor insert error:", insertError);
      // Don't block checkout - the payment is more important
    }

    // Decrement remaining_available using service role for the update
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    await supabaseAdmin
      .from("sponsorship_levels")
      .update({ remaining_available: level.remaining_available - 1 })
      .eq("id", sponsorship_level_id);

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
