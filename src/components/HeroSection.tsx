import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import CountdownTimer from "./CountdownTimer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const donationAmounts = [10, 20, 50, 100];

const HeroSection = () => {
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
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="CB Extravaganza event" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/60" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 pt-24 pb-16">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">
          {/* Left — Hero text (3 cols) */}
          <div className="lg:col-span-3">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-display italic text-primary-foreground/80 text-xl md:text-2xl mb-2"
            >
              37th Annual
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="font-display font-black text-primary-foreground text-3xl md:text-5xl lg:text-5xl leading-[0.9] mb-6"
            >
              CHRISTIAN
              <br />
              BROTHERS
              <br />
              <span className="tracking-wider">EXTRAVAGANZA</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="font-display font-bold text-accent text-2xl md:text-3xl mb-6"
            >
              Saturday, September 12, 2026
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="font-body text-primary-foreground/90 text-base md:text-lg max-w-lg mb-8 leading-relaxed"
            >
              For 150 years, Christian Brothers has shaped the lives of young men and women in Sacramento.
              This year, we celebrate that legacy alongside the incredible local businesses
              that make our community thrive. Join us for an evening of world-class food,
              wine, craft beer, and live music—all raising critical funds for tuition
              assistance so that every deserving student can access a CB education.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <Link to="/tickets">
                <Button
                  size="lg"
                  className="bg-background text-primary font-body font-bold text-lg px-10 py-6 rounded-full hover:bg-background/90 animate-pulse-glow"
                >
                  TICKETS
                </Button>
              </Link>
              <Link to="/get-involved">
                <Button
                  size="lg"
                  className="bg-accent text-accent-foreground font-body font-bold text-lg px-10 py-6 rounded-full hover:bg-accent/90"
                >
                  GET INVOLVED
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              <CountdownTimer targetDate="2026-09-12T18:00:00" />
            </motion.div>
          </div>

          {/* Right — Floating donation card (2 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="lg:col-span-2 flex justify-center lg:justify-end"
          >
            <div className="bg-background/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-sm">
              <div className="flex items-center gap-2 mb-1">
                <Heart className="h-5 w-5 text-accent fill-accent" />
                <h3 className="font-display font-bold text-foreground text-lg">
                  Donate Now
                </h3>
              </div>
              <p className="font-body text-muted-foreground text-sm mb-5">
                Support the Tuition Assistance Fund with a monthly gift.
              </p>

              <label className="font-body font-semibold text-foreground text-xs uppercase tracking-wide mb-2 block">
                Amount
              </label>

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

              <div className="grid grid-cols-4 gap-2 mb-6">
                {donationAmounts.map((amt) => (
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

              <Button
                onClick={() => handleDonate(activeAmount)}
                disabled={loading !== null || activeAmount < 1}
                className="w-full rounded-lg font-body font-bold text-base py-6 bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg"
              >
                {loading !== null ? "Processing..." : `DONATE $${activeAmount}/mo`}
              </Button>

              <p className="font-body text-muted-foreground text-xs text-center mt-3">
                100% goes to tuition assistance
              </p>
            </div>
          </motion.div>
        </div>

        {/* Presenting Sponsor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="mt-12 flex items-center gap-4"
        >
          <p className="font-display italic text-primary-foreground/70 text-sm">
            Presenting Sponsor
          </p>
          <span className="font-display font-black text-primary-foreground text-2xl tracking-widest">
            CAPTRUST
          </span>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
