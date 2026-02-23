import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const levelColors: Record<string, string> = {
  "Wine Glass": "bg-primary/20 text-primary",
  "Platinum": "bg-accent/20 text-accent-foreground",
  "Falcon": "bg-secondary/20 text-secondary-foreground",
  "Silver": "bg-muted text-muted-foreground",
  "Presenting": "bg-primary text-primary-foreground",
};

const AdminSponsors = () => {
  const { data: sponsors, isLoading } = useQuery({
    queryKey: ["admin-sponsors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sponsors")
        .select("*")
        .order("value", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="font-body text-muted-foreground">{sponsors?.length ?? 0} sponsors</p>
      </div>
      <div className="rounded-lg border border-border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-body">Company</TableHead>
              <TableHead className="font-body">Contact</TableHead>
              <TableHead className="font-body">Level</TableHead>
              <TableHead className="font-body text-right">Value</TableHead>
              <TableHead className="font-body text-right">Paid</TableHead>
              <TableHead className="font-body">Payment</TableHead>
              <TableHead className="font-body">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sponsors?.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-body font-semibold">{s.company_name}</TableCell>
                <TableCell className="font-body text-sm text-muted-foreground">{s.contact_name ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={levelColors[s.sponsorship_level] ?? ""}>
                    {s.sponsorship_level}
                  </Badge>
                </TableCell>
                <TableCell className="font-body text-right">${(s.value ?? 0).toLocaleString()}</TableCell>
                <TableCell className="font-body text-right">${(s.amount_paid ?? 0).toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={s.payment_status === "Paid" ? "default" : "outline"} className="font-body">
                    {s.payment_status ?? "Pending"}
                  </Badge>
                </TableCell>
                <TableCell className="font-body text-sm">{s.status ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminSponsors;
