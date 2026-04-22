import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="font-display font-black text-foreground text-3xl md:text-4xl mb-2">
            Privacy Policy
          </h1>
          <p className="font-body text-muted-foreground text-sm mb-8">
            Last updated: April 22, 2026
          </p>

          <div className="prose prose-sm max-w-none font-body text-foreground space-y-6">
            <section>
              <h2 className="font-display font-bold text-xl mb-2">Who we are</h2>
              <p>
                The Christian Brothers Extravaganza ("Extravaganza", "we", "us", "our") is an
                annual fundraising event produced by Christian Brothers High School, a 501(c)(3)
                non-profit located in Sacramento, California. All proceeds benefit the CBHS
                Tuition Assistance Fund. This Privacy Policy explains how we collect, use, and
                share information when you visit{" "}
                <a href="https://cbextravaganza.lovable.app" className="text-primary underline">
                  cbextravaganza.lovable.app
                </a>{" "}
                or interact with us.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl mb-2">Information we collect</h2>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Contact information</strong> you provide on ticket, vendor, sponsor, or volunteer forms (name, company, email, phone, mailing address).</li>
                <li><strong>Transaction details</strong> for ticket purchases, sponsorships, and donations (amounts, items, payment status). Card numbers are processed by Stripe and never stored on our servers.</li>
                <li><strong>Communication preferences</strong>, including SMS and email opt-in status, the page where consent was given, and a timestamp.</li>
                <li><strong>Communication history</strong> — records of emails, text messages, and calls between us and you (including transcripts when you participate in an AI voice call).</li>
                <li><strong>Technical data</strong> such as IP address, device, and browser information collected automatically.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl mb-2">How we use information</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>Process ticket purchases, sponsorships, vendor applications, and donations.</li>
                <li>Send transactional confirmations and event-day logistics.</li>
                <li>With your consent, send event updates by email, SMS text message, or AI-assisted phone call.</li>
                <li>Manage relationships with vendors, sponsors, and supporters in our internal CRM.</li>
                <li>Comply with legal and tax-reporting obligations.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl mb-2">SMS messaging</h2>
              <p>
                If you opt in, we send event-related SMS text messages (purchase confirmations,
                schedule updates, day-of logistics) to the mobile number you provide. Message
                frequency varies. Message and data rates may apply. Reply{" "}
                <strong>STOP</strong> at any time to unsubscribe, or <strong>HELP</strong> for help.
                We never share or sell your mobile number or SMS opt-in data with third parties
                or affiliates for marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl mb-2">How we share information</h2>
              <p>We share information only with vendors that help us run the event:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Stripe</strong> — payment processing</li>
                <li><strong>Twilio</strong> — SMS and voice delivery</li>
                <li><strong>Resend</strong> — transactional email delivery</li>
                <li><strong>Supabase / Lovable Cloud</strong> — secure data hosting</li>
                <li><strong>ElevenLabs</strong> — AI voice synthesis (when you participate in an AI-assisted call)</li>
              </ul>
              <p>We do not sell personal information.</p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl mb-2">Your rights</h2>
              <p>
                You may request access, correction, or deletion of your personal information at
                any time by emailing{" "}
                <a href="mailto:extravaganza@cbhs-sacramento.org" className="text-primary underline">
                  extravaganza@cbhs-sacramento.org
                </a>
                . You can unsubscribe from email at any time using the link in any message, and
                from SMS by replying STOP.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl mb-2">Data retention</h2>
              <p>
                We retain personal information as long as needed to operate the event, comply
                with legal obligations, and maintain donor records. Aggregated, anonymous data
                may be retained indefinitely.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl mb-2">Contact us</h2>
              <p>
                Christian Brothers High School<br />
                4315 Martin Luther King Jr Blvd<br />
                Sacramento, CA 95820<br />
                <a href="mailto:extravaganza@cbhs-sacramento.org" className="text-primary underline">
                  extravaganza@cbhs-sacramento.org
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
