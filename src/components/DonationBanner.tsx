import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

const amounts = [10, 20, 50, 100];

const DonationBanner = () => {
  const [loading, setLoading] = useState<number | null>(null);
  const [selected, setSelected] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>("");

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

  const activeAmount = customAmount ? Number(customAmount) : selected;

  return (
    <section className="relative bg-primary pt-20 pb-16 md:py-0 md:pt-20 md:min-h-[520px] flex items-center overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-primary-foreground/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Left — headline */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-display font-bold text-accent text-sm uppercase tracking-widest mb-3">
              Support Our Mission
            </p>
            <h2 className="font-display font-black text-primary-foreground text-3xl md:text-4xl lg:text-5xl leading-tight mb-5">
              HELP US BUILD
              <br />
              A BRIGHTER <span className="text-accent">FUTURE</span>
              <br />
              FOR EVERY STUDENT
            </h2>
            <p className="font-body text-primary-foreground/80 text-base md:text-lg max-w-md leading-relaxed mb-6">
              Together, we can ensure every deserving young man has access to a 
              Christian Brothers education through the Tuition Assistance Fund.
            </p>
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5 text-accent fill-accent" />
              <span className="font-body text-primary-foreground/60 text-sm">
                100% of donations go to tuition assistance
              </span>
            </div>
          </motion.div>

          {/* Right — donation card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center md:justify-end"
          >
            <div className="bg-background rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-sm">
              <h3 className="font-display font-bold text-foreground text-lg mb-1">
                Instant Donate Now
              </h3>
              <p className="font-body text-muted-foreground text-sm mb-5">
                Choose a monthly amount to support students.
              </p>

              {/* Amount label */}
              <label className="font-body font-semibold text-foreground text-xs uppercase tracking-wide mb-2 block">
                Amount
              </label>

              {/* Custom amount input */}
              <input
                type="number"
                min="1"
                placeholder="Custom amount"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  if (e.target.value) setSelected(0);
                }}
                className="w-full rounded-lg border border-border bg-muted/50 px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-3"
              />

              {/* Preset amounts */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {amounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => {
                      setSelected(amt);
                      setCustomAmount("");
                    }}
                    className={`
                      rounded-lg py-2.5 font-body font-bold text-sm transition-all duration-200 border
                      ${selected === amt && !customAmount
                        ? "bg-accent text-accent-foreground border-accent shadow-md"
                        : "bg-background text-foreground border-border hover:border-accent/50"
                      }
                    `}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              {/* Donate button */}
              <Button
                onClick={() => handleDonate(activeAmount)}
                disabled={loading !== null || activeAmount < 1}
                className="w-full rounded-lg font-body font-bold text-base py-6 bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg"
              >
                {loading !== null ? "Processing..." : `DONATE $${activeAmount}/mo`}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DonationBanner;
