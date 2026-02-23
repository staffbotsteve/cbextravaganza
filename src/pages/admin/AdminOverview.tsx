import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HandHeart, Store, DollarSign, Users } from "lucide-react";

const AdminOverview = () => {
  const { data: sponsorStats } = useQuery({
    queryKey: ["admin-sponsor-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sponsors").select("id, value, amount_paid, sponsorship_level");
      if (error) throw error;
      return {
        count: data.length,
        totalValue: data.reduce((sum, s) => sum + (s.value ?? 0), 0),
        totalPaid: data.reduce((sum, s) => sum + (s.amount_paid ?? 0), 0),
      };
    },
  });

  const { data: vendorStats } = useQuery({
    queryKey: ["admin-vendor-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vendors").select("id, status");
      if (error) throw error;
      return {
        count: data.length,
        confirmed: data.filter((v) => v.status === "Confirmed" || v.status === "Form Received").length,
      };
    },
  });

  const cards = [
    { label: "Total Sponsors", value: sponsorStats?.count ?? 0, icon: HandHeart, color: "text-primary" },
    { label: "Sponsorship Value", value: `$${(sponsorStats?.totalValue ?? 0).toLocaleString()}`, icon: DollarSign, color: "text-accent" },
    { label: "Amount Collected", value: `$${(sponsorStats?.totalPaid ?? 0).toLocaleString()}`, icon: DollarSign, color: "text-green-600" },
    { label: "Vendors", value: `${vendorStats?.confirmed ?? 0} / ${vendorStats?.count ?? 0}`, icon: Store, color: "text-primary" },
  ];

  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-body font-semibold text-muted-foreground">{c.label}</CardTitle>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <p className="font-display font-bold text-2xl text-foreground">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="font-body text-muted-foreground">
          <p>Select a section from the sidebar to manage sponsors, vendors, or guests. Twilio and ElevenLabs integrations coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;
