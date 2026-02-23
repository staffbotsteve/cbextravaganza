import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const donationAmounts = [5, 20, 50, 100];

const DonationCard = () => {
  const [loading, setLoading] = useState<number | null>(null);
  const [selected, setSelected] = useState<number>(5);
  const [customAmount, setCustomAmount] = useState<string>("");

  const handleDonate = async (amount: number) => {
    setLoading(amount);
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-donation-checkout",
        { body: { amount } }
      );
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  const activeAmount = customAmount ? Number(customAmount) : selected;

  return (
    <div className="bg-background/80 backdrop-blur-md rounded-2xl shadow-lg p-4 md:p-5 w-full max-w-sm">
      <div className="flex items-center gap-2 mb-1">
        <Heart className="h-4 w-4 text-accent fill-accent" />
        <h3 className="font-display font-bold text-foreground text-sm">
          Donate Now
        </h3>
      </div>
      <p className="font-body text-muted-foreground text-xs mb-3">
        Support the Tuition Assistance Fund with a monthly gift.
      </p>

      <input
        type="number"
        min="1"
        placeholder="Custom amount"
        value={customAmount}
        onChange={(e) => {
          setCustomAmount(e.target.value);
          if (e.target.value) setSelected(0);
        }}
        className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 font-body text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-2"
      />

      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {donationAmounts.map((amt) => (
          <button
            key={amt}
            onClick={() => {
              setSelected(amt);
              setCustomAmount("");
            }}
            className={`rounded-lg py-2 font-body font-bold text-xs transition-all border ${
              selected === amt && !customAmount
                ? "bg-accent text-accent-foreground border-accent shadow-md"
                : "bg-background text-foreground border-border hover:border-accent/50"
            }`}
          >
            ${amt}
          </button>
        ))}
      </div>

      <Button
        onClick={() => handleDonate(activeAmount)}
        disabled={loading !== null || activeAmount < 1}
        size="sm"
        className="w-full rounded-lg font-body font-bold text-xs py-4 bg-accent text-accent-foreground hover:bg-accent/90"
      >
        {loading !== null ? "Processing..." : `DONATE $${activeAmount}/mo`}
      </Button>

      <p className="font-body text-muted-foreground text-[10px] text-center mt-2">
        100% goes to tuition assistance
      </p>
    </div>
  );
};

export default DonationCard;
