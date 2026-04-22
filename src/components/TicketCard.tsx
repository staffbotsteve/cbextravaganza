import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ticket, Minus, Plus, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SmsConsent from "@/components/SmsConsent";

const donationPresets = [5, 10, 20];

type InventoryItem = {
  ticket_type: string;
  label: string;
  price_cents: number;
  remaining_available: number;
  is_active: boolean;
  sort_order: number;
};

const TicketCard = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [tab, setTab] = useState("select");
  const [donationAmount, setDonationAmount] = useState<number>(5);
  const [customDonation, setCustomDonation] = useState("");
  const [addDonation, setAddDonation] = useState(true);
  const [phone, setPhone] = useState("");
  const [smsOptIn, setSmsOptIn] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        
        const res = await fetch(
          `${supabaseUrl}/rest/v1/ticket_inventory?select=ticket_type,label,price_cents,remaining_available,is_active,sort_order&is_active=eq.true&order=sort_order`,
          {
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
            },
          }
        );
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setInventory(data);
          const initial: Record<string, number> = {};
          data.forEach((i: InventoryItem) => (initial[i.ticket_type] = 0));
          setQuantities(initial);
        }
      } catch (err) {
        console.error("Ticket fetch failed:", err);
      }
    };
    fetchInventory();
  }, []);

  const updateQty = (key: string, delta: number) => {
    const item = inventory.find((i) => i.ticket_type === key);
    if (!item) return;
    setQuantities((prev) => ({
      ...prev,
      [key]: Math.max(0, Math.min(item.remaining_available, (prev[key] || 0) + delta)),
    }));
  };

  const total = inventory.reduce(
    (sum, t) => sum + (t.price_cents / 100) * (quantities[t.ticket_type] || 0),
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
            phone: phone.trim() || null,
            sms_opt_in: smsOptIn,
            sms_opt_in_url: window.location.href,
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

        <TabsContent value="select" className="space-y-3">
          {inventory.map((t) => {
            const soldOut = t.remaining_available <= 0;
            return (
              <div
                key={t.ticket_type}
                className={`flex items-center justify-between rounded-lg border px-3 py-2.5 ${
                  soldOut
                    ? "border-muted bg-muted/50 opacity-60"
                    : "border-border"
                }`}
              >
                <div>
                  <p className="font-body font-semibold text-foreground text-sm">
                    {t.label}
                  </p>
                  <p className="font-body text-muted-foreground text-xs">
                    ${(t.price_cents / 100).toFixed(0)}
                    {!soldOut && (
                      <span className="ml-1 text-[10px]">
                        ({t.remaining_available} left)
                      </span>
                    )}
                    {soldOut && (
                      <span className="ml-1 text-destructive font-bold text-[10px]">
                        SOLD OUT
                      </span>
                    )}
                  </p>
                </div>
                {!soldOut && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(t.ticket_type, -1)}
                      className="h-7 w-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="font-body font-bold text-foreground w-6 text-center text-sm">
                      {quantities[t.ticket_type] || 0}
                    </span>
                    <button
                      onClick={() => updateQty(t.ticket_type, 1)}
                      className="h-7 w-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="font-body font-bold text-foreground text-sm">Total</span>
            <span className="font-display font-black text-primary text-xl">${total}</span>
          </div>

          <Button
            onClick={() => setTab("donate")}
            disabled={!hasItems}
            className="w-full rounded-lg font-body font-bold text-sm py-5"
          >
            Continue
          </Button>
        </TabsContent>

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
            <span className="font-body text-foreground text-sm">Yes, add a donation</span>
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
            {inventory.map(
              (t) =>
                (quantities[t.ticket_type] || 0) > 0 && (
                  <div key={t.ticket_type} className="flex justify-between font-body text-xs text-muted-foreground">
                    <span>{quantities[t.ticket_type]}× {t.label}</span>
                    <span>${(t.price_cents / 100) * quantities[t.ticket_type]}</span>
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
              <span>${total + (addDonation ? activeDonation : 0)}</span>
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
