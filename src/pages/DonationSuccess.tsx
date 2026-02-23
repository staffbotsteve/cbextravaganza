import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DonationBanner from "@/components/DonationBanner";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const DonationSuccess = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 text-center">
          <CheckCircle className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="font-display font-black text-foreground text-4xl md:text-5xl mb-3">
            Thank You!
          </h1>
          <p className="font-body text-muted-foreground text-lg max-w-xl mx-auto mb-8">
            Your recurring donation has been set up successfully. Your generosity helps students
            in our community access a Christian Brothers education.
          </p>
          <Link to="/">
            <Button className="rounded-full font-body font-bold">Back to Home</Button>
          </Link>
        </div>
      </main>
      <DonationBanner />
      <Footer />
    </div>
  );
};

export default DonationSuccess;
