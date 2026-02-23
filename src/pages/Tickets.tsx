import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Individual",
    price: "$75",
    description: "General admission for one guest",
    features: ["Access to all stages", "Food & beverage tastings", "Commemorative cup"],
  },
  {
    name: "Couple",
    price: "$140",
    description: "General admission for two guests",
    features: ["Access to all stages", "Food & beverage tastings", "Two commemorative cups", "Priority entry"],
    popular: true,
  },
  {
    name: "Table of 8",
    price: "$600",
    description: "Reserved table for eight guests",
    features: ["Reserved table seating", "Access to all stages", "Food & beverage tastings", "Commemorative cups", "Early entry"],
  },
  {
    name: "VIP Private Reserve",
    price: "$150",
    description: "Exclusive VIP experience per person",
    features: ["Private Reserve lounge", "Premium tastings", "Kyle Tuttle '05 performance", "Dedicated bar", "VIP parking"],
  },
];

const Tickets = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h1 className="font-display font-black text-foreground text-4xl md:text-5xl mb-3">
              Get Your Tickets
            </h1>
            <p className="font-body text-muted-foreground text-lg max-w-xl mx-auto">
              Choose your experience for the 37th Annual CB Extravaganza
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {tiers.map((tier) => (
              <Card
                key={tier.name}
                className={`relative ${tier.popular ? "border-primary shadow-lg scale-105" : ""}`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-body font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="font-display text-xl">{tier.name}</CardTitle>
                  <CardDescription className="font-body">{tier.description}</CardDescription>
                  <p className="font-display font-black text-3xl text-primary mt-2">{tier.price}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 font-body text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full rounded-full font-body font-bold">
                    Buy Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Tickets;
