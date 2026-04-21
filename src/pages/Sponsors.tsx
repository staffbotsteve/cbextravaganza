import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const EVENT_YEAR = 2026;

const tierOrder = [
  "Presenting Sponsor",
  "Main Stage Sponsor",
  "Venue Sponsor",
  "Cigar Lounge Sponsor",
  "Whiskey Glass Sponsor",
  "Wine Glass Sponsor",
  "Falcon Sponsor",
  "In-Kind",
];

const Sponsors = () => {
  const { data: sponsors, isLoading } = useQuery({
    queryKey: ["public-sponsors", EVENT_YEAR],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("participation")
        .select("id, sponsor_tier, sponsor_value, organizations(id, name)")
        .eq("year", EVENT_YEAR)
        .eq("role", "sponsor")
        .in("status", ["Form Received", "Confirmed", "Paid"])
        .order("sponsor_value", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const groupedSponsors = tierOrder
    .map((tier) => ({
      tier,
      sponsors:
        sponsors
          ?.filter((s) => s.sponsor_tier === tier && s.organizations)
          .map((s) => ({ id: s.id, name: s.organizations!.name })) ?? [],
    }))
    .filter((g) => g.sponsors.length > 0);

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

          {isLoading ? (
            <p className="text-center font-body text-muted-foreground">Loading sponsors...</p>
          ) : (
            <div className="max-w-4xl mx-auto space-y-10 mb-12">
              {groupedSponsors.map((g) => (
                <div key={g.tier} className="text-center">
                  <h3
                    className={`font-display font-bold text-2xl mb-4 ${
                      g.tier === "Presenting Sponsor"
                        ? "text-accent"
                        : g.tier === "Venue Sponsor"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {g.tier}s
                  </h3>
                  <div className="flex flex-wrap justify-center gap-3">
                    {g.sponsors.map((s) => (
                      <span
                        key={s.id}
                        className="bg-card border border-border rounded-xl px-6 py-3 font-body font-semibold text-foreground text-sm"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center">
            <p className="font-body text-muted-foreground mb-4">Interested in sponsoring?</p>
            <Link to="/sponsors/apply">
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
