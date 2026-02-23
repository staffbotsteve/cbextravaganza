import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const { vendor_email, vendor_name, company_name, is_update } = await req.json();

    if (!vendor_email || !company_name) {
      return new Response(
        JSON.stringify({ error: 'vendor_email and company_name are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const subject = is_update
      ? `Welcome Back! Your Vendor Info Has Been Updated — CB Extravaganza 2025`
      : `Thank You for Your Vendor Application — CB Extravaganza 2025`;

    const greeting = vendor_name ? `Dear ${vendor_name}` : `Dear ${company_name} Team`;

    const body = is_update
      ? `
<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 24px;">
  <h1 style="color: #1e3a5f; font-size: 24px;">Welcome Back!</h1>
  <p>${greeting},</p>
  <p>Thank you for updating your vendor information for the <strong>37th Annual Christian Brothers Extravaganza</strong> on <strong>Saturday, September 6, 2025</strong>.</p>
  <p>Your updated information for <strong>${company_name}</strong> has been received and recorded.</p>
  <h3 style="color: #1e3a5f;">Event Reminders</h3>
  <ul>
    <li><strong>Date:</strong> Saturday, September 6, 2025</li>
    <li><strong>Hours:</strong> 5:30 PM – 10:00 PM</li>
    <li><strong>VIP Early Access:</strong> 5:30 – 7:00 PM</li>
    <li><strong>Setup:</strong> As early as 2:00 PM</li>
    <li><strong>Location:</strong> Christian Brothers High School, 4315 MLK Jr. Blvd, Sacramento, CA 95820</li>
  </ul>
  <p>We're excited to have you back! If you have any questions, please contact us at <a href="mailto:extravaganza@cbhs-sacramento.org">extravaganza@cbhs-sacramento.org</a> or call (916) 733-3608.</p>
  <p style="margin-top: 24px;">Warm regards,<br/><strong>CB Extravaganza Committee</strong></p>
</div>`
      : `
<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 24px;">
  <h1 style="color: #1e3a5f; font-size: 24px;">Application Received!</h1>
  <p>${greeting},</p>
  <p>Thank you for submitting your vendor application for the <strong>37th Annual Christian Brothers Extravaganza</strong> on <strong>Saturday, September 6, 2025</strong>.</p>
  <p>We've received your application for <strong>${company_name}</strong> and our team will review it shortly. You'll hear from us soon with next steps.</p>
  <h3 style="color: #1e3a5f;">Event Details</h3>
  <ul>
    <li><strong>Date:</strong> Saturday, September 6, 2025</li>
    <li><strong>Hours:</strong> 5:30 PM – 10:00 PM</li>
    <li><strong>VIP Early Access:</strong> 5:30 – 7:00 PM (~400 VIP guests)</li>
    <li><strong>General Admission:</strong> 7:00 PM (1,600+ guests)</li>
    <li><strong>Setup:</strong> As early as 2:00 PM</li>
    <li><strong>Location:</strong> Christian Brothers High School, 4315 MLK Jr. Blvd, Sacramento, CA 95820</li>
  </ul>
  <h3 style="color: #1e3a5f;">What We Provide</h3>
  <ul>
    <li>8 ft table with linens</li>
    <li>Large beverage tub with ice</li>
    <li>Paper products for serving</li>
    <li>Guests bring their own event glassware</li>
  </ul>
  <p>If you have any questions, please contact us at <a href="mailto:extravaganza@cbhs-sacramento.org">extravaganza@cbhs-sacramento.org</a> or call (916) 733-3608.</p>
  <p style="margin-top: 24px;">Warm regards,<br/><strong>CB Extravaganza Committee</strong></p>
</div>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'CB Extravaganza <onboarding@resend.dev>',
        to: [vendor_email],
        subject,
        html: body,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Resend API error:', data);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: data }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
