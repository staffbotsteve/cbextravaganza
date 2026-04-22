import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="font-display font-black text-foreground text-3xl md:text-4xl mb-2">
            Terms &amp; Conditions
          </h1>
          <p className="font-body text-muted-foreground text-sm mb-8">
            Last updated: April 22, 2026
          </p>

          <div className="prose prose-sm max-w-none font-body text-foreground space-y-6">
            <section>
              <h2 className="font-display font-bold text-xl mb-2">Acceptance of terms</h2>
              <p>
                By accessing or using{" "}
                <a href="https://cbextravaganza.lovable.app" className="text-primary underline">
                  cbextravaganza.lovable.app
                </a>{" "}
                or by purchasing tickets, sponsorships, or submitting a vendor application, you
                agree to these Terms &amp; Conditions and to our{" "}
                <a href="/privacy" className="text-primary underline">Privacy Policy</a>.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl mb-2">The event</h2>
              <p>
                The 37th Annual Christian Brothers Extravaganza is a fundraising wine, beer, and
                food festival held on Saturday, September 12, 2026 at Christian Brothers High
                School in Sacramento, California. All proceeds benefit the CBHS Tuition Assistance
                Fund. Christian Brothers High School is a 501(c)(3) non-profit organization
                (Federal Tax ID #68-0322360).
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl mb-2">Tickets</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>All ticket sales are final. Tickets are non-refundable.</li>
                <li>Tickets are transferable; please bring valid ID matching the registered name on entry.</li>
                <li>You must be 21 years or older to purchase or use a ticket. ID will be checked at the door.</li>
                <li>The event takes place rain or shine. There are no refunds for weather.</li>
                <li>We reserve the right to refuse entry or remove guests for unsafe behavior.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl mb-2">Sponsorships and vendor agreements</h2>
              <p>
                Sponsorship and vendor commitments are governed by the specific application or
                agreement you sign at the time of registration. Sponsorship payments are
                considered charitable contributions to the CBHS Tuition Assistance Fund and are
                tax-deductible to the fullest extent allowed by law, less the fair-market value of
                any goods or services received.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl mb-2">Communications consent</h2>
              <p>
                When you opt in on any of our forms you consent to receive transactional and
                event-related messages from CB Extravaganza by email, SMS, and (where requested)
                phone call. SMS message frequency varies. Message &amp; data rates may apply.
                Reply <strong>STOP</strong> to opt out of SMS, or <strong>HELP</strong> for help.
                See our <a href="/privacy" className="text-primary underline">Privacy Policy</a>{" "}
                for full details.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl mb-2">Photography and media release</h2>
              <p>
                Attendance at the event constitutes consent to be photographed, filmed, or
                recorded. Christian Brothers High School may use these images and recordings for
                promotional, educational, or fundraising purposes without further notice or
                compensation.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl mb-2">Limitation of liability</h2>
              <p>
                To the maximum extent permitted by law, Christian Brothers High School and the
                Extravaganza organizers are not liable for any indirect, incidental, or
                consequential damages arising from your use of this site or attendance at the
                event. Attendees assume the risks inherent in consuming alcohol responsibly and
                in attending a public event.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl mb-2">Changes</h2>
              <p>
                We may update these Terms from time to time. Material changes will be posted on
                this page with a revised "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl mb-2">Contact</h2>
              <p>
                Questions about these Terms? Email{" "}
                <a href="mailto:extravaganza@cbhs-sacramento.org" className="text-primary underline">
                  extravaganza@cbhs-sacramento.org
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
