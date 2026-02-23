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
    <section className="relative bg-secondary text-secondary-foreground py-16 md:py-24 overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 bg-primary/20 text-primary-foreground rounded-full px-4 py-1.5 mb-6">
            <Heart className="h-4 w-4 fill-current text-accent" />
            <span className="font-body font-bold text-sm uppercase tracking-wider">Make a Difference</span>
          </div>

          <h2 className="font-display font-black text-3xl md:text-5xl mb-4 leading-tight">
            Help a Student Access a<br />
            <span className="text-accent">CB Education</span>
          </h2>

          <p className="font-body text-secondary-foreground/70 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Your monthly gift directly funds the Tuition Assistance Program, giving students 
            in our Sacramento community the opportunity to experience a Christian Brothers education. 
            Every dollar makes a lasting impact.
          </p>

          {/* Amount selector */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {amounts.map((amt) => (
              <button
                key={amt}
                onClick={() => setSelected(amt)}
                className={`
                  relative rounded-xl px-6 py-4 font-display font-bold text-xl transition-all duration-200
                  ${selected === amt
                    ? "bg-accent text-accent-foreground shadow-lg shadow-accent/30 scale-105"
                    : "bg-secondary-foreground/10 text-secondary-foreground hover:bg-secondary-foreground/20"
                  }
                `}
              >
                <span className="text-sm font-body font-normal block -mb-1">monthly</span>
                ${amt}
              </button>
            ))}
          </div>

          <Button
            size="lg"
            onClick={() => handleDonate(selected)}
            disabled={loading !== null}
            className="rounded-full font-body font-bold text-lg px-10 py-6 bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/30"
          >
            {loading !== null ? "Redirecting..." : `Donate $${selected}/month`}
          </Button>

          <p className="font-body text-secondary-foreground/40 text-xs mt-4">
            Secure payment powered by Stripe. Cancel anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default DonationBanner;
