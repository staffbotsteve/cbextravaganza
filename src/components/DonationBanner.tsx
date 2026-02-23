import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

const amounts = [1, 5, 20, 100];

const DonationBanner = () => {
  const [loading, setLoading] = useState<number | null>(null);
  const [selected, setSelected] = useState<number>(20);

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
    <section className="relative bg-secondary text-secondary-foreground pt-20 py-6 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-4 md:gap-8">
          <div className="flex items-center gap-3 shrink-0">
            <Heart className="h-5 w-5 fill-current text-accent" />
            <p className="font-display font-bold text-sm md:text-base">
              Support Tuition Assistance
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {amounts.map((amt) => (
              <button
                key={amt}
                onClick={() => setSelected(amt)}
                className={`
                  rounded-full px-4 py-1.5 font-body font-bold text-sm transition-all duration-200
                  ${selected === amt
                    ? "bg-accent text-accent-foreground shadow-md scale-105"
                    : "bg-secondary-foreground/10 text-secondary-foreground hover:bg-secondary-foreground/20"
                  }
                `}
              >
                ${amt}/mo
              </button>
            ))}
          </div>

          <Button
            size="sm"
            onClick={() => handleDonate(selected)}
            disabled={loading !== null}
            className="rounded-full font-body font-bold bg-accent text-accent-foreground hover:bg-accent/90 shrink-0"
          >
            {loading !== null ? "..." : `Donate $${selected}/mo`}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DonationBanner;
