import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";

interface RecipientInput {
  contact_id?: string | null;
  contact_phone_id?: string | null;
  org_id?: string | null;
  phone: string;
  first_name?: string | null;
  last_name?: string | null;
  org_name?: string | null;
}

interface Payload {
  name: string;
  body: string;
  from: string; // Twilio sending number, E.164
  recipients: RecipientInput[];
}

function renderTemplate(tpl: string, r: RecipientInput): string {
  return tpl
    .replace(/\{\{\s*first_name\s*\}\}/gi, r.first_name ?? "")
    .replace(/\{\{\s*last_name\s*\}\}/gi, r.last_name ?? "")
    .replace(/\{\{\s*org_name\s*\}\}/gi, r.org_name ?? "");
}

function normalizePhone(p: string): string | null {
  const digits = p.replace(/[^\d+]/g, "");
  if (!digits) return null;
  if (digits.startsWith("+")) return digits;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!TWILIO_API_KEY) throw new Error("TWILIO_API_KEY not configured");

    // Auth: require admin user
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: roleCheck } = await admin.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!roleCheck) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = (await req.json()) as Payload;
    if (!payload?.body || !payload?.from || !Array.isArray(payload.recipients)) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create campaign
    const { data: campaign, error: cErr } = await admin
      .from("campaigns")
      .insert({
        name: payload.name || "Untitled SMS",
        channel: "sms",
        body: payload.body,
        status: "sending",
        total_recipients: payload.recipients.length,
        created_by: userData.user.id,
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (cErr) throw cErr;

    let sent = 0;
    let failed = 0;

    for (const r of payload.recipients) {
      const to = normalizePhone(r.phone);
      const renderedBody = renderTemplate(payload.body, r);

      // Insert recipient row
      const { data: recRow } = await admin
        .from("campaign_recipients")
        .insert({
          campaign_id: campaign.id,
          contact_id: r.contact_id ?? null,
          contact_phone_id: r.contact_phone_id ?? null,
          org_id: r.org_id ?? null,
          phone: to ?? r.phone,
          rendered_body: renderedBody,
          status: "pending",
        })
        .select()
        .single();

      if (!to) {
        await admin
          .from("campaign_recipients")
          .update({ status: "failed", error: "Invalid phone" })
          .eq("id", recRow!.id);
        failed++;
        continue;
      }

      try {
        const statusCallback = `${SUPABASE_URL}/functions/v1/twilio-status-callback`;
        const resp = await fetch(`${GATEWAY_URL}/Messages.json`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "X-Connection-Api-Key": TWILIO_API_KEY,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: to,
            From: payload.from,
            Body: renderedBody,
            StatusCallback: statusCallback,
          }),
        });
        const data = await resp.json();
        if (!resp.ok) {
          throw new Error(data?.message || `Twilio error ${resp.status}`);
        }

        await admin
          .from("campaign_recipients")
          .update({
            status: "sent",
            twilio_sid: data.sid,
            sent_at: new Date().toISOString(),
          })
          .eq("id", recRow!.id);

        await admin.from("messages").insert({
          channel: "sms",
          direction: "outbound",
          status: "sent",
          org_id: r.org_id ?? null,
          contact_id: r.contact_id ?? null,
          campaign_id: campaign.id,
          from_address: payload.from,
          to_address: to,
          body: renderedBody,
          external_id: data.sid,
        });

        // Log activity on org
        if (r.org_id) {
          await admin.from("activities").insert({
            org_id: r.org_id,
            contact_id: r.contact_id ?? null,
            type: "sms",
            direction: "outbound",
            subject: `SMS: ${payload.name}`,
            body: renderedBody,
            logged_by: userData.user.email ?? "system",
          });
        }

        // Bump status if still Prospect
        if (r.org_id) {
          await admin
            .from("participation")
            .update({ status: "Contacted" })
            .eq("org_id", r.org_id)
            .eq("year", new Date().getFullYear())
            .in("status", ["Prospect", null as unknown as string]);
        }

        sent++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await admin
          .from("campaign_recipients")
          .update({ status: "failed", error: msg })
          .eq("id", recRow!.id);
        await admin.from("messages").insert({
          channel: "sms",
          direction: "outbound",
          status: "failed",
          org_id: r.org_id ?? null,
          contact_id: r.contact_id ?? null,
          campaign_id: campaign.id,
          from_address: payload.from,
          to_address: to,
          body: renderedBody,
          error: msg,
        });
        failed++;
      }
    }

    await admin
      .from("campaigns")
      .update({
        status: "sent",
        sent_count: sent,
        failed_count: failed,
      })
      .eq("id", campaign.id);

    return new Response(
      JSON.stringify({ campaign_id: campaign.id, sent, failed }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("send-sms-campaign error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
