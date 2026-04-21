import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const EVENT_YEAR = 2026;

const Vendors = () => {
  const { data: vendors, isLoading } = useQuery({
    queryKey: ["public-vendors", EVENT_YEAR],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("participation")
        .select("id, vendor_type, status, organizations(id, name)")
        .eq("year", EVENT_YEAR)
        .eq("role", "vendor")
        .in("status", ["Form Received", "Confirmed"])
        .order("vendor_type");
      if (error) throw error;
      return data;
    },
  });

  const categories = [
    { type: "wine", label: "Wineries" },
    { type: "beer", label: "Breweries & Cider" },
    { type: "food", label: "Restaurants & Food" },
    { type: "other", label: "Specialty Vendors" },
  ];

  const grouped = categories
    .map((cat) => ({
      ...cat,
      items:
        vendors
          ?.filter((v) => v.vendor_type === cat.type && v.organizations)
          .map((v) => ({ id: v.id, name: v.organizations!.name }))
          .sort((a, b) => a.name.localeCompare(b.name)) ?? [],
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h1 className="font-display font-black text-foreground text-4xl md:text-5xl mb-3">Vendors</h1>
            <p className="font-body text-muted-foreground text-lg max-w-xl mx-auto">
              Sacramento's best restaurants, wineries, breweries, and more come together for one incredible evening.
            </p>
          </div>

          {isLoading ? (
            <p className="text-center font-body text-muted-foreground">Loading vendors...</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
              {grouped.map((cat) => (
                <div key={cat.type} className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="font-display font-bold text-xl mb-4 text-primary">
                    {cat.label} ({cat.items.length})
                  </h3>
                  <ul className="space-y-1.5">
                    {cat.items.map((v) => (
                      <li key={v.id} className="font-body text-foreground text-sm">{v.name}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <div className="text-center">
            <p className="font-body text-muted-foreground mb-4">Interested in becoming a vendor?</p>
            <Link to="/vendors/apply">
              <Button className="rounded-full font-body font-bold">Apply as a Vendor</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Vendors;
