import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const amounts = [1, 5, 20, 100];

const DonationBanner = () => {
  const [loading, setLoading] = useState<number | null>(null);

  const handleDonate = async (amount: number) => {
    setLoading(amount);
    try {
      const { data, error } = await supabase.functions.invoke("create-donation-checkout", {
        body: { amount },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <section className="bg-primary text-primary-foreground py-8">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart className="h-5 w-5 fill-current" />
          <h3 className="font-display font-bold text-lg md:text-xl">
            Support Tuition Assistance
          </h3>
        </div>
        <p className="font-body text-primary-foreground/80 text-sm md:text-base max-w-xl mx-auto mb-5">
          Your monthly gift helps students in our community access a Christian Brothers education.
          Every dollar makes a difference.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {amounts.map((amt) => (
            <Button
              key={amt}
              variant="secondary"
              className="rounded-full font-body font-bold min-w-[100px]"
              onClick={() => handleDonate(amt)}
              disabled={loading !== null}
            >
              {loading === amt ? "..." : `$${amt}/mo`}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DonationBanner;
