import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const vendorCategories = [
  { name: "Wineries", items: ["Beachaven Vineyards", "Arrington Vineyards", "Natchez Hills Winery", "Paris Winery"] },
  { name: "Breweries", items: ["Memphis Made Brewing", "Wiseacre", "High Cotton Brewing", "Ghost River Brewing", "Crosstown Brewing"] },
  { name: "Restaurants", items: ["Central BBQ", "The Majestic Grille", "Itta Bena", "Flight Restaurant", "Puck Food Hall", "Aldo's Pizza Pies"] },
  { name: "Spirits", items: ["Old Dominick Distillery", "Westy's"] },
];

const Vendors = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h1 className="font-display font-black text-foreground text-4xl md:text-5xl mb-3">Vendors</h1>
            <p className="font-body text-muted-foreground text-lg max-w-xl mx-auto">
              Memphis's best restaurants, wineries, breweries, and more come together for one incredible evening.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            {vendorCategories.map((cat) => (
              <div key={cat.name} className="bg-card rounded-xl p-6 border border-border">
                <h3 className="font-display font-bold text-xl mb-4 text-primary">{cat.name}</h3>
                <ul className="space-y-2">
                  {cat.items.map((item) => (
                    <li key={item} className="font-body text-foreground text-sm">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="font-body text-muted-foreground mb-4">Interested in becoming a vendor?</p>
            <Link to="/get-involved">
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
