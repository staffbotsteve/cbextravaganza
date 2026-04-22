import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
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

const CURRENT_YEAR = 2026;

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

const orgsLink = (params: Record<string, string>) => {
  const qs = new URLSearchParams(params).toString();
  return `/admin/organizations${qs ? `?${qs}` : ""}`;
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
      to: orgsLink({ filter: "committed_dollars" }),
    },
    {
      label: "Collected $",
      value: `$${totalPaid.toLocaleString()}`,
      icon: CheckCircle2,
      color: "text-green-600",
      to: orgsLink({ filter: "collected_dollars" }),
    },
    {
      label: "Forms Outstanding",
      value: formsOutstanding,
      icon: FileText,
      color: "text-amber-600",
      to: orgsLink({ filter: "forms_outstanding" }),
    },
    {
      label: "Committed Partners",
      value: committed,
      icon: HandHeart,
      color: "text-primary",
      to: orgsLink({ filter: "committed" }),
    },
    {
      label: "Tents Requested",
      value: tents,
      icon: Tent,
      color: "text-muted-foreground",
      to: orgsLink({ filter: "tents" }),
    },
    {
      label: "Electric Requested",
      value: electric,
      icon: Zap,
      color: "text-muted-foreground",
      to: orgsLink({ filter: "electric" }),
    },
    {
      label: "Volunteers Needed",
      value: volunteers,
      icon: Users,
      color: "text-secondary",
      to: orgsLink({ filter: "volunteers" }),
    },
    {
      label: "Total Records",
      value: rows.length,
      icon: Store,
      color: "text-muted-foreground",
      to: orgsLink({ filter: "any_participation" }),
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
          Click any tile or row to see the underlying records.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="block transition-transform hover:scale-[1.02]"
          >
            <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
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
          </Link>
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
                          <Link
                            to={orgsLink({ status })}
                            className="hover:text-primary hover:underline"
                          >
                            {status}
                          </Link>
                        </td>
                        {ROLES.map((r) => {
                          const count = row[r] ?? 0;
                          return (
                            <td
                              key={r}
                              className="text-right py-2 px-3 text-foreground tabular-nums"
                            >
                              {count > 0 ? (
                                <Link
                                  to={orgsLink({ status, role: r })}
                                  className="hover:text-primary hover:underline"
                                >
                                  {count}
                                </Link>
                              ) : (
                                <span className="text-muted-foreground">0</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="text-right py-2 px-3 text-muted-foreground tabular-nums">
                          {row["Other"] ?? 0}
                        </td>
                        <td className="text-right py-2 px-3 font-semibold text-foreground tabular-nums">
                          {total > 0 ? (
                            <Link
                              to={orgsLink({ status })}
                              className="hover:text-primary hover:underline"
                            >
                              {total}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
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
