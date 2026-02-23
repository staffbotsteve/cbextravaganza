import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ticket, Minus, Plus, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ticketTypes = [
  { key: "general", label: "General Admission", price: 75 },
  { key: "vip", label: "VIP Private Reserve", price: 150 },
  { key: "parking", label: "Parking Pass", price: 25 },
];

const donationPresets = [5, 10, 20];

const TicketCard = () => {
  const [quantities, setQuantities] = useState<Record<string, number>>({
    general: 0,
    vip: 0,
    parking: 0,
  });
  const [tab, setTab] = useState("select");
  const [donationAmount, setDonationAmount] = useState<number>(5);
  const [customDonation, setCustomDonation] = useState("");
  const [addDonation, setAddDonation] = useState(true);
  const [loading, setLoading] = useState(false);

  const updateQty = (key: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [key]: Math.max(0, (prev[key] || 0) + delta),
    }));
  };

  const total = ticketTypes.reduce(
    (sum, t) => sum + t.price * (quantities[t.key] || 0),
    0
  );

  const hasItems = Object.values(quantities).some((q) => q > 0);

  const activeDonation = customDonation ? Number(customDonation) : donationAmount;

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-ticket-checkout",
        {
          body: {
            items: quantities,
            donationAmount: addDonation ? activeDonation : 0,
          },
        }
      );
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background/95 backdrop-blur-md rounded-2xl shadow-2xl p-5 md:p-6 w-full max-w-sm">
      <div className="flex items-center gap-2 mb-3">
        <Ticket className="h-5 w-5 text-primary" />
        <h3 className="font-display font-bold text-foreground text-lg">
          Get Tickets
        </h3>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full mb-4">
          <TabsTrigger value="select" className="flex-1 font-body text-xs">
            1. Select
          </TabsTrigger>
          <TabsTrigger
            value="donate"
            className="flex-1 font-body text-xs"
            disabled={!hasItems}
          >
            2. Review & Donate
          </TabsTrigger>
        </TabsList>

        {/* Tab 1 — Select tickets */}
        <TabsContent value="select" className="space-y-3">
          {ticketTypes.map((t) => (
            <div
              key={t.key}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5"
            >
              <div>
                <p className="font-body font-semibold text-foreground text-sm">
                  {t.label}
                </p>
                <p className="font-body text-muted-foreground text-xs">
                  ${t.price}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQty(t.key, -1)}
                  className="h-7 w-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="font-body font-bold text-foreground w-6 text-center text-sm">
                  {quantities[t.key]}
                </span>
                <button
                  onClick={() => updateQty(t.key, 1)}
                  className="h-7 w-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="font-body font-bold text-foreground text-sm">
              Total
            </span>
            <span className="font-display font-black text-primary text-xl">
              ${total}
            </span>
          </div>

          <Button
            onClick={() => setTab("donate")}
            disabled={!hasItems}
            className="w-full rounded-lg font-body font-bold text-sm py-5"
          >
            Continue
          </Button>
        </TabsContent>

        {/* Tab 2 — Donation upsell + checkout */}
        <TabsContent value="donate" className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Heart className="h-4 w-4 text-accent fill-accent" />
            <p className="font-body font-semibold text-foreground text-sm">
              Add a monthly donation?
            </p>
          </div>
          <p className="font-body text-muted-foreground text-xs">
            Support the Tuition Assistance Fund with an additional gift.
          </p>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={addDonation}
              onChange={(e) => setAddDonation(e.target.checked)}
              className="accent-accent"
            />
            <span className="font-body text-foreground text-sm">
              Yes, add a donation
            </span>
          </label>

          {addDonation && (
            <>
              <div className="grid grid-cols-3 gap-2">
                {donationPresets.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => {
                      setDonationAmount(amt);
                      setCustomDonation("");
                    }}
                    className={`rounded-lg py-2 font-body font-bold text-sm transition-all border ${
                      donationAmount === amt && !customDonation
                        ? "bg-accent text-accent-foreground border-accent shadow-md"
                        : "bg-background text-foreground border-border hover:border-accent/50"
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                placeholder="Custom amount"
                value={customDonation}
                onChange={(e) => {
                  setCustomDonation(e.target.value);
                  if (e.target.value) setDonationAmount(0);
                }}
                className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </>
          )}

          <div className="border-t border-border pt-3 space-y-1">
            {ticketTypes.map(
              (t) =>
                quantities[t.key] > 0 && (
                  <div
                    key={t.key}
                    className="flex justify-between font-body text-xs text-muted-foreground"
                  >
                    <span>
                      {quantities[t.key]}× {t.label}
                    </span>
                    <span>${t.price * quantities[t.key]}</span>
                  </div>
                )
            )}
            {addDonation && activeDonation > 0 && (
              <div className="flex justify-between font-body text-xs text-accent">
                <span>Donation</span>
                <span>${activeDonation}</span>
              </div>
            )}
            <div className="flex justify-between font-body font-bold text-foreground text-sm pt-1">
              <span>Total</span>
              <span>
                ${total + (addDonation ? activeDonation : 0)}
              </span>
            </div>
          </div>

          <Button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full rounded-lg font-body font-bold text-sm py-5 bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg"
          >
            {loading ? "Processing..." : "CHECKOUT"}
          </Button>

          <button
            onClick={() => setTab("select")}
            className="w-full font-body text-muted-foreground text-xs underline"
          >
            ← Back to selection
          </button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TicketCard;
