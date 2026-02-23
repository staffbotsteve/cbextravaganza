import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const sponsorTiers = [
  {
    tier: "Presenting Sponsor",
    sponsors: ["CAPTRUST"],
    color: "text-accent",
  },
  {
    tier: "Gold Sponsors",
    sponsors: ["Sponsor A", "Sponsor B", "Sponsor C"],
    color: "text-primary",
  },
  {
    tier: "Silver Sponsors",
    sponsors: ["Sponsor D", "Sponsor E", "Sponsor F", "Sponsor G"],
    color: "text-muted-foreground",
  },
];

const Sponsors = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h1 className="font-display font-black text-foreground text-4xl md:text-5xl mb-3">Our Sponsors</h1>
            <p className="font-body text-muted-foreground text-lg max-w-xl mx-auto">
              Thank you to the generous sponsors who make the Extravaganza possible.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-10 mb-12">
            {sponsorTiers.map((t) => (
              <div key={t.tier} className="text-center">
                <h3 className={`font-display font-bold text-2xl mb-4 ${t.color}`}>{t.tier}</h3>
                <div className="flex flex-wrap justify-center gap-4">
                  {t.sponsors.map((s) => (
                    <span
                      key={s}
                      className="bg-card border border-border rounded-xl px-8 py-4 font-display font-bold text-lg text-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="font-body text-muted-foreground mb-4">Interested in sponsoring?</p>
            <Link to="/get-involved">
              <Button className="rounded-full font-body font-bold">Become a Sponsor</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Sponsors;
