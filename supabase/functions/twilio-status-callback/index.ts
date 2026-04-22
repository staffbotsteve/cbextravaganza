import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

// Twilio error codes that indicate the destination is a landline / cannot
// receive SMS. When we see these, we re-classify the contact_phone so we
// don't try again.
const LANDLINE_ERROR_CODES = new Set([
  "30006", // Landline or unreachable carrier
  "30005", // Unknown destination handset
  "21614", // 'To' number is not a valid mobile number
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const formData = await req.formData();
    const sid = String(formData.get("MessageSid") ?? "");
    const status = String(formData.get("MessageStatus") ?? "");
    const errorCode = formData.get("ErrorCode")
      ? String(formData.get("ErrorCode"))
      : null;
    const to = String(formData.get("To") ?? "");

    if (!sid) {
      return new Response("ok", {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    // Update the campaign_recipients row matched by twilio_sid
    const updates: Record<string, unknown> = { status };
    if (status === "delivered") updates.delivered_at = new Date().toISOString();
    if (errorCode) updates.error = `Twilio error ${errorCode}`;

    const { data: recipient } = await admin
      .from("campaign_recipients")
      .update(updates)
      .eq("twilio_sid", sid)
      .select("contact_phone_id, contact_id, phone")
      .maybeSingle();

    // Update the messages row too
    await admin
      .from("messages")
      .update({
        status,
        error: errorCode ? `Twilio error ${errorCode}` : null,
      })
      .eq("external_id", sid);

    // Landline detection — re-classify the phone we attempted to message.
    if (errorCode && LANDLINE_ERROR_CODES.has(errorCode)) {
      const phoneId = recipient?.contact_phone_id;
      if (phoneId) {
        await admin
          .from("contact_phones")
          .update({
            phone_type: "office",
            sms_capable: false,
            last_sms_status: status,
            last_sms_error_code: errorCode,
            last_checked_at: new Date().toISOString(),
          })
          .eq("id", phoneId);
      } else if (recipient?.phone) {
        // Fallback: match by phone string
        await admin
          .from("contact_phones")
          .update({
            phone_type: "office",
            sms_capable: false,
            last_sms_status: status,
            last_sms_error_code: errorCode,
            last_checked_at: new Date().toISOString(),
          })
          .eq("phone", recipient.phone);
      }
    } else if (recipient?.contact_phone_id) {
      // Healthy delivery — record status on the phone
      await admin
        .from("contact_phones")
        .update({
          last_sms_status: status,
          last_sms_error_code: errorCode,
          last_checked_at: new Date().toISOString(),
          // If it delivered, it's definitely a mobile/SMS-capable number
          ...(status === "delivered" ? { sms_capable: true } : {}),
        })
        .eq("id", recipient.contact_phone_id);
    }

    return new Response("ok", {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("twilio-status-callback error:", msg);
    return new Response("ok", {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }
});
