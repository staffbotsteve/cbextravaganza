import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Search, FileText } from "lucide-react";

type DocRow = {
  id: string;
  type: string | null;
  year: number | null;
  status: string | null;
  file_url: string | null;
  sent_at: string | null;
  signed_at: string | null;
  organizations: { id: string; name: string } | null;
};

const statusColor: Record<string, string> = {
  Signed: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
  Sent: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  Draft: "bg-muted text-muted-foreground",
  Pending: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
};

const AdminDocuments = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select(
          "id, type, year, status, file_url, sent_at, signed_at, organizations:org_id (id, name)"
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as DocRow[];
    },
  });

  const statuses = useMemo(() => {
    const s = new Set<string>();
    (data ?? []).forEach((d) => d.status && s.add(d.status));
    return Array.from(s).sort();
  }, [data]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (data ?? []).filter((d) => {
      if (statusFilter !== "all" && d.status !== statusFilter) return false;
      if (!q) return true;
      return (
        (d.type ?? "").toLowerCase().includes(q) ||
        (d.organizations?.name ?? "").toLowerCase().includes(q)
      );
    });
  }, [data, search, statusFilter]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="lg:w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="font-body text-xs text-muted-foreground mt-3">
            {isLoading
              ? "Loading…"
              : `${filtered.length} of ${data?.length ?? 0} documents`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Signed</TableHead>
                <TableHead className="text-right">File</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-8"
                  >
                    No documents on file.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-foreground">
                        {d.type ?? "—"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {d.organizations?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {d.year ?? "—"}
                  </TableCell>
                  <TableCell>
                    {d.status ? (
                      <Badge
                        variant="secondary"
                        className={statusColor[d.status] ?? ""}
                      >
                        {d.status}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {d.sent_at
                      ? new Date(d.sent_at).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {d.signed_at
                      ? new Date(d.signed_at).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {d.file_url ? (
                      <Button asChild size="sm" variant="outline">
                        <a href={d.file_url} target="_blank" rel="noreferrer">
                          Open
                        </a>
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDocuments;
