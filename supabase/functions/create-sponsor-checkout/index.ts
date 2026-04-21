import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const EVENT_YEAR = 2026;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      sponsorship_level_id,
      company_name,
      contact_name,
      email,
      phone,
      address_line1,
      address_line2,
      city,
      state,
      zip,
      preferred_venue,
      notes,
      signature_name,
      signature_title,
      agree_terms,
      signed_at,
      signed_user_agent,
    } = await req.json();

    if (!sponsorship_level_id || !company_name || !contact_name || !email) {
      throw new Error("Missing required fields");
    }
    if (!signature_name || !agree_terms) {
      throw new Error("Signature and agreement are required");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Look up the sponsorship level
    const { data: level, error: levelError } = await supabaseAdmin
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

    // ---------- CRM upsert: organizations -> contacts -> participation ----------
    const orgName = String(company_name).trim();

    // 1) Find or create organization (case-insensitive name match)
    const { data: existingOrg } = await supabaseAdmin
      .from("organizations")
      .select("id")
      .ilike("name", orgName)
      .maybeSingle();

    const orgPayload = {
      name: orgName,
      type: "Sponsor",
      email,
      address_line1: address_line1 || null,
      address_line2: address_line2 || null,
      city: city || null,
      state: state || "CA",
      zip: zip || null,
    };

    let orgId: string;
    if (existingOrg?.id) {
      await supabaseAdmin.from("organizations").update(orgPayload).eq("id", existingOrg.id);
      orgId = existingOrg.id;
    } else {
      const { data, error } = await supabaseAdmin
        .from("organizations")
        .insert(orgPayload)
        .select("id")
        .single();
      if (error) throw error;
      orgId = data.id;
    }

    // 2) Upsert primary contact (match by email within this org)
    const [firstName, ...lastParts] = String(contact_name).trim().split(/\s+/);
    const lastName = lastParts.join(" ") || null;

    const { data: existingContact } = await supabaseAdmin
      .from("contacts")
      .select("id")
      .eq("org_id", orgId)
      .ilike("email", email)
      .maybeSingle();

    const contactPayload = {
      org_id: orgId,
      first_name: firstName || null,
      last_name: lastName,
      email,
      phone: phone || null,
      is_primary: true,
    };

    if (existingContact?.id) {
      await supabaseAdmin.from("contacts").update(contactPayload).eq("id", existingContact.id);
    } else {
      await supabaseAdmin.from("contacts").insert(contactPayload);
    }

    // 3) Upsert participation row for this year + role=sponsor
    const { data: existingPart } = await supabaseAdmin
      .from("participation")
      .select("id")
      .eq("org_id", orgId)
      .eq("year", EVENT_YEAR)
      .eq("role", "sponsor")
      .maybeSingle();

    const participationPayload = {
      org_id: orgId,
      year: EVENT_YEAR,
      role: "sponsor",
      sponsor_tier: level.name,
      sponsor_value: Number(level.amount),
      tickets_qty: level.tickets_included ?? 0,
      parking_qty: level.parking_included ?? 0,
      preferred_venue: preferred_venue || null,
      payment_method: "Stripe Checkout",
      payment_amount: Number(level.amount),
      payment_status: "Pending",
      status: "Form Received",
      owner_name: contact_name,
    };

    if (existingPart?.id) {
      await supabaseAdmin
        .from("participation")
        .update(participationPayload)
        .eq("id", existingPart.id);
    } else {
      const { error: pErr } = await supabaseAdmin
        .from("participation")
        .insert(participationPayload);
      if (pErr) console.error("Participation insert error:", pErr);
    }

    // 4) Optional notes -> activity
    if (notes && String(notes).trim()) {
      await supabaseAdmin.from("activities").insert({
        org_id: orgId,
        type: "form_note",
        subject: `Sponsor form note (${EVENT_YEAR})`,
        body: String(notes).trim(),
        direction: "inbound",
      });
    }

    // 5) Decrement remaining sponsorship inventory
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
    console.error("create-sponsor-checkout error:", message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
