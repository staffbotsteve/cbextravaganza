import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X } from "lucide-react";

const AdminVendors = () => {
  const { data: vendors, isLoading } = useQuery({
    queryKey: ["admin-vendors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .order("company_name");
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
        <p className="font-body text-muted-foreground">{vendors?.length ?? 0} vendors</p>
      </div>
      <div className="rounded-lg border border-border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-body">Company</TableHead>
              <TableHead className="font-body">Type</TableHead>
              <TableHead className="font-body">Contact</TableHead>
              <TableHead className="font-body">Phone</TableHead>
              <TableHead className="font-body text-center">Tent</TableHead>
              <TableHead className="font-body text-center">Electric</TableHead>
              <TableHead className="font-body">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors?.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-body font-semibold">{v.company_name}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-body capitalize">{v.vendor_type}</Badge>
                </TableCell>
                <TableCell className="font-body text-sm text-muted-foreground">{v.contact_name ?? "—"}</TableCell>
                <TableCell className="font-body text-sm text-muted-foreground">{v.phone ?? "—"}</TableCell>
                <TableCell className="text-center">
                  {v.needs_tent ? <Check className="h-4 w-4 text-primary mx-auto" /> : <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />}
                </TableCell>
                <TableCell className="text-center">
                  {v.needs_electricity ? <Check className="h-4 w-4 text-primary mx-auto" /> : <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />}
                </TableCell>
                <TableCell>
                  <Badge variant={v.status === "Confirmed" || v.status === "Form Received" ? "default" : "outline"} className="font-body">
                    {v.status ?? "Prospect"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminVendors;
