import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

function normalizePhone(p: string): string {
  const digits = p.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return digits;
}

function detectKeyword(body: string): "yes" | "stop" | null {
  const t = body.trim().toUpperCase();
  if (/^(YES|Y|CONFIRM|COMMIT|IN)\b/.test(t)) return "yes";
  if (/^(STOP|STOPALL|UNSUBSCRIBE|CANCEL|END|QUIT|NO|OUT)\b/.test(t))
    return "stop";
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Twilio sends application/x-www-form-urlencoded
    const formData = await req.formData();
    const from = normalizePhone(String(formData.get("From") ?? ""));
    const to = String(formData.get("To") ?? "");
    const body = String(formData.get("Body") ?? "");
    const sid = String(formData.get("MessageSid") ?? "");

    // Find contact by phone (try a few variants)
    const phoneVariants = [
      from,
      from.replace("+1", ""),
      from.replace("+", ""),
    ];

    const { data: contacts } = await admin
      .from("contacts")
      .select("id, org_id, first_name, last_name")
      .or(phoneVariants.map((p) => `phone.eq.${p}`).join(","))
      .limit(1);

    const contact = contacts?.[0];
    const keyword = detectKeyword(body);

    // Log the inbound message
    await admin.from("messages").insert({
      channel: "sms",
      direction: "inbound",
      status: "received",
      org_id: contact?.org_id ?? null,
      contact_id: contact?.id ?? null,
      from_address: from,
      to_address: to,
      body,
      external_id: sid,
    });

    // Log activity if matched to org
    if (contact?.org_id) {
      await admin.from("activities").insert({
        org_id: contact.org_id,
        contact_id: contact.id,
        type: "sms",
        direction: "inbound",
        subject: keyword
          ? `SMS reply (${keyword.toUpperCase()})`
          : "SMS reply",
        body,
        logged_by: "twilio-webhook",
      });

      // Mark replied on most recent campaign recipient
      await admin
        .from("campaign_recipients")
        .update({
          replied_at: new Date().toISOString(),
          reply_body: body,
        })
        .eq("contact_id", contact.id)
        .is("replied_at", null);
    }

    // Keyword automation
    let twiml = "";
    if (keyword === "stop" && contact) {
      await admin
        .from("contacts")
        .update({ sms_opt_in: false })
        .eq("id", contact.id);
      if (contact.org_id) {
        await admin
          .from("participation")
          .update({ status: "Not Participating" })
          .eq("org_id", contact.org_id)
          .eq("year", new Date().getFullYear());
      }
      twiml =
        "<Response><Message>You've been unsubscribed from CB Extravaganza messages. Reply HELP for help.</Message></Response>";
    } else if (keyword === "yes" && contact?.org_id) {
      await admin
        .from("participation")
        .update({ status: "Committed" })
        .eq("org_id", contact.org_id)
        .eq("year", new Date().getFullYear());
      twiml =
        "<Response><Message>Thanks for confirming! Our team will be in touch shortly.</Message></Response>";
    } else if (/^HELP\b/i.test(body.trim())) {
      twiml =
        "<Response><Message>CB Extravaganza: For event info visit cbextravaganza.com. Reply STOP to unsubscribe. Msg&data rates may apply.</Message></Response>";
    } else {
      twiml = "<Response></Response>";
    }

    return new Response(twiml, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/xml" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("twilio-inbound-sms error:", msg);
    return new Response("<Response></Response>", {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/xml" },
    });
  }
});
