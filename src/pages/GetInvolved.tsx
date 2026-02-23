import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HandHeart, Store, Users, DollarSign } from "lucide-react";

const options = [
  {
    icon: Users,
    title: "Volunteer",
    description: "Help make the Extravaganza a success! We need volunteers for setup, registration, cleanup, and more.",
    cta: "Sign Up to Volunteer",
  },
  {
    icon: Store,
    title: "Become a Vendor",
    description: "Showcase your restaurant, winery, brewery, or business to hundreds of Memphis's finest.",
    cta: "Apply as Vendor",
  },
  {
    icon: DollarSign,
    title: "Sponsor the Event",
    description: "Sponsorships range from individual support to presenting sponsor level, all benefiting the Tuition Assistance Fund.",
    cta: "Explore Sponsorships",
  },
  {
    icon: HandHeart,
    title: "Make a Donation",
    description: "Every dollar goes directly to the CBHS Tuition Assistance Fund, helping families access a CB education.",
    cta: "Donate Now",
  },
];

const GetInvolved = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h1 className="font-display font-black text-foreground text-4xl md:text-5xl mb-3">Get Involved</h1>
            <p className="font-body text-muted-foreground text-lg max-w-xl mx-auto">
              There are many ways to support the 36th Annual Christian Brothers Extravaganza.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {options.map((opt) => (
              <Card key={opt.title} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <opt.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-display text-xl">{opt.title}</CardTitle>
                  <CardDescription className="font-body">{opt.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="rounded-full font-body font-bold w-full">{opt.cta}</Button>
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

export default GetInvolved;
