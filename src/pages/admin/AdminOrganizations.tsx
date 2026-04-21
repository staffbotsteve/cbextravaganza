import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Building2 } from "lucide-react";
import OrgDetailDrawer from "@/components/admin/OrgDetailDrawer";

const CURRENT_YEAR = 2025;
const ROLES = ["Sponsor", "Vendor", "Distributor", "Class Table"] as const;
const STATUSES = [
  "Prospect",
  "Contacted",
  "In Discussion",
  "Form Received",
  "Committed",
  "Paid",
  "Not Participating",
] as const;

type OrgRow = {
  id: string;
  name: string;
  type: string | null;
  city: string | null;
  state: string | null;
  participation: {
    role: string | null;
    status: string | null;
    owner_name: string | null;
    sponsor_value: number | null;
    payment_amount: number | null;
    year: number;
  }[];
};

const statusColor: Record<string, string> = {
  Prospect: "bg-muted text-muted-foreground",
  Contacted: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  "In Discussion":
    "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  "Form Received":
    "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200",
  Committed:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  Paid: "bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-100",
  "Not Participating": "bg-destructive/10 text-destructive",
};

const AdminOrganizations = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-organizations", CURRENT_YEAR],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select(
          "id, name, type, city, state, participation (role, status, owner_name, sponsor_value, payment_amount, year)"
        )
        .order("name");
      if (error) throw error;
      return (data ?? []) as OrgRow[];
    },
  });

  const owners = useMemo(() => {
    const set = new Set<string>();
    (data ?? []).forEach((o) =>
      o.participation.forEach((p) => p.owner_name && set.add(p.owner_name))
    );
    return Array.from(set).sort();
  }, [data]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (data ?? []).filter((org) => {
      if (q && !org.name.toLowerCase().includes(q)) return false;
      const current = org.participation.find((p) => p.year === CURRENT_YEAR);
      if (roleFilter !== "all" && current?.role !== roleFilter) return false;
      if (statusFilter !== "all" && current?.status !== statusFilter) return false;
      if (ownerFilter !== "all" && current?.owner_name !== ownerFilter) return false;
      return true;
    });
  }, [data, search, roleFilter, statusFilter, ownerFilter]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search organizations…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="lg:w-44">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="lg:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={ownerFilter} onValueChange={setOwnerFilter}>
              <SelectTrigger className="lg:w-44">
                <SelectValue placeholder="Owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All owners</SelectItem>
                {owners.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="font-body text-xs text-muted-foreground mt-3">
            {isLoading
              ? "Loading…"
              : `Showing ${filtered.length} of ${data?.length ?? 0} organizations`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">Committed</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-8"
                  >
                    No organizations match these filters.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((org) => {
                const p = org.participation.find((p) => p.year === CURRENT_YEAR);
                return (
                  <TableRow
                    key={org.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedOrgId(org.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground">
                            {org.name}
                          </p>
                          {org.type && (
                            <p className="text-xs text-muted-foreground">
                              {org.type}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p?.role ?? "—"}
                    </TableCell>
                    <TableCell>
                      {p?.status ? (
                        <Badge
                          variant="secondary"
                          className={statusColor[p.status] ?? ""}
                        >
                          {p.status}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p?.owner_name ?? "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {p?.sponsor_value
                        ? `$${Number(p.sponsor_value).toLocaleString()}`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {p?.payment_amount
                        ? `$${Number(p.payment_amount).toLocaleString()}`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {[org.city, org.state].filter(Boolean).join(", ") || "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <OrgDetailDrawer
        orgId={selectedOrgId}
        open={!!selectedOrgId}
        onOpenChange={(o) => !o && setSelectedOrgId(null)}
      />
    </div>
  );
};

export default AdminOrganizations;
