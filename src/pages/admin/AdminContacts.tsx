import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Mail, Phone } from "lucide-react";

type ContactRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  is_primary: boolean | null;
  cb_connection: string | null;
  organizations: { id: string; name: string } | null;
};

const AdminContacts = () => {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select(
          "id, first_name, last_name, email, phone, is_primary, cb_connection, organizations:org_id (id, name)"
        )
        .order("last_name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as ContactRow[];
    },
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return data ?? [];
    return (data ?? []).filter((c) => {
      const name = [c.first_name, c.last_name].filter(Boolean).join(" ").toLowerCase();
      return (
        name.includes(q) ||
        (c.email ?? "").toLowerCase().includes(q) ||
        (c.phone ?? "").includes(q) ||
        (c.organizations?.name ?? "").toLowerCase().includes(q)
      );
    });
  }, [data, search]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, phone, or organization…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <p className="font-body text-xs text-muted-foreground mt-3">
            {isLoading
              ? "Loading…"
              : `${filtered.length} of ${data?.length ?? 0} contacts`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>CB Connection</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-8"
                  >
                    No contacts found.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {[c.first_name, c.last_name].filter(Boolean).join(" ") ||
                          "(no name)"}
                      </span>
                      {c.is_primary && (
                        <Badge variant="secondary" className="text-xs">
                          Primary
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.organizations?.name ?? "—"}
                  </TableCell>
                  <TableCell>
                    {c.email ? (
                      <a
                        href={`mailto:${c.email}`}
                        className="flex items-center gap-1 text-primary hover:underline text-sm"
                      >
                        <Mail className="h-3 w-3" />
                        {c.email}
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {c.phone ? (
                      <a
                        href={`tel:${c.phone}`}
                        className="flex items-center gap-1 text-primary hover:underline text-sm"
                      >
                        <Phone className="h-3 w-3" />
                        {c.phone}
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {c.cb_connection ?? "—"}
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

export default AdminContacts;
