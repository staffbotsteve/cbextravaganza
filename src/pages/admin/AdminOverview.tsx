import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  HandHeart,
  Store,
  DollarSign,
  Users,
  FileText,
  Zap,
  Tent,
  CheckCircle2,
} from "lucide-react";

const CURRENT_YEAR = 2025;

const STATUSES = [
  "Prospect",
  "Contacted",
  "In Discussion",
  "Form Received",
  "Committed",
  "Paid",
  "Not Participating",
] as const;

const ROLES = ["Sponsor", "Vendor", "Distributor", "Class Table"] as const;

type Participation = {
  role: string | null;
  status: string | null;
  payment_amount: number | null;
  sponsor_value: number | null;
  tent: boolean | null;
  electric: boolean | null;
  volunteers_needed: number | null;
};

const AdminOverview = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-overview", CURRENT_YEAR],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("participation")
        .select(
          "role, status, payment_amount, sponsor_value, tent, electric, volunteers_needed"
        )
        .eq("year", CURRENT_YEAR);
      if (error) throw error;
      return (data ?? []) as Participation[];
    },
  });

  const rows = data ?? [];

  const totalCommitted = rows.reduce(
    (sum, r) => sum + Number(r.sponsor_value ?? 0),
    0
  );
  const totalPaid = rows.reduce(
    (sum, r) => sum + Number(r.payment_amount ?? 0),
    0
  );
  const formsOutstanding = rows.filter(
    (r) =>
      r.status === "Contacted" ||
      r.status === "In Discussion" ||
      r.status === "Prospect"
  ).length;
  const tents = rows.filter((r) => r.tent).length;
  const electric = rows.filter((r) => r.electric).length;
  const volunteers = rows.reduce(
    (sum, r) => sum + Number(r.volunteers_needed ?? 0),
    0
  );
  const committed = rows.filter(
    (r) => r.status === "Committed" || r.status === "Paid"
  ).length;

  const stats = [
    {
      label: "Committed $",
      value: `$${totalCommitted.toLocaleString()}`,
      icon: DollarSign,
      color: "text-primary",
    },
    {
      label: "Collected $",
      value: `$${totalPaid.toLocaleString()}`,
      icon: CheckCircle2,
      color: "text-green-600",
    },
    {
      label: "Forms Outstanding",
      value: formsOutstanding,
      icon: FileText,
      color: "text-amber-600",
    },
    {
      label: "Committed Partners",
      value: committed,
      icon: HandHeart,
      color: "text-primary",
    },
    {
      label: "Tents Requested",
      value: tents,
      icon: Tent,
      color: "text-muted-foreground",
    },
    {
      label: "Electric Requested",
      value: electric,
      icon: Zap,
      color: "text-muted-foreground",
    },
    {
      label: "Volunteers Needed",
      value: volunteers,
      icon: Users,
      color: "text-secondary",
    },
    {
      label: "Total Records",
      value: rows.length,
      icon: Store,
      color: "text-muted-foreground",
    },
  ];

  // Funnel: status × role grid
  const funnel: Record<string, Record<string, number>> = {};
  for (const status of STATUSES) {
    funnel[status] = {};
    for (const role of ROLES) funnel[status][role] = 0;
    funnel[status]["Other"] = 0;
  }
  for (const r of rows) {
    const s = (r.status ?? "Prospect") as (typeof STATUSES)[number];
    const role = (ROLES as readonly string[]).includes(r.role ?? "")
      ? (r.role as string)
      : "Other";
    if (!funnel[s]) funnel[s] = {};
    funnel[s][role] = (funnel[s][role] ?? 0) + 1;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-bold text-2xl text-foreground mb-1">
          {CURRENT_YEAR} Pipeline
        </h2>
        <p className="font-body text-sm text-muted-foreground">
          Live view of all sponsors, vendors, and partners for the current event year.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-body font-semibold text-muted-foreground">
                {s.label}
              </CardTitle>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="font-display font-bold text-2xl text-foreground">
                  {s.value}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Pipeline Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-body">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 font-semibold text-muted-foreground">
                      Status
                    </th>
                    {ROLES.map((r) => (
                      <th
                        key={r}
                        className="text-right py-2 px-3 font-semibold text-muted-foreground"
                      >
                        {r}
                      </th>
                    ))}
                    <th className="text-right py-2 px-3 font-semibold text-muted-foreground">
                      Other
                    </th>
                    <th className="text-right py-2 px-3 font-semibold text-foreground">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {STATUSES.map((status) => {
                    const row = funnel[status] ?? {};
                    const total =
                      ROLES.reduce((s, r) => s + (row[r] ?? 0), 0) +
                      (row["Other"] ?? 0);
                    return (
                      <tr
                        key={status}
                        className="border-b border-border/50 hover:bg-muted/40"
                      >
                        <td className="py-2 px-3 font-semibold text-foreground">
                          {status}
                        </td>
                        {ROLES.map((r) => (
                          <td
                            key={r}
                            className="text-right py-2 px-3 text-foreground tabular-nums"
                          >
                            {row[r] ?? 0}
                          </td>
                        ))}
                        <td className="text-right py-2 px-3 text-muted-foreground tabular-nums">
                          {row["Other"] ?? 0}
                        </td>
                        <td className="text-right py-2 px-3 font-semibold text-foreground tabular-nums">
                          {total}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;
