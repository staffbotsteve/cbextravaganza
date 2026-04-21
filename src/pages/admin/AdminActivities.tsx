import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Phone, Mail, MessageSquare, StickyNote } from "lucide-react";

type ActivityRow = {
  id: string;
  type: string | null;
  direction: string | null;
  subject: string | null;
  body: string | null;
  occurred_at: string | null;
  logged_by: string | null;
  organizations: { id: string; name: string } | null;
};

const TYPE_ICONS: Record<string, typeof Phone> = {
  call: Phone,
  email: Mail,
  sms: MessageSquare,
  note: StickyNote,
};

const AdminActivities = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-activities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select(
          "id, type, direction, subject, body, occurred_at, logged_by, organizations:org_id (id, name)"
        )
        .order("occurred_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as unknown as ActivityRow[];
    },
  });

  const types = useMemo(() => {
    const s = new Set<string>();
    (data ?? []).forEach((a) => a.type && s.add(a.type));
    return Array.from(s).sort();
  }, [data]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (data ?? []).filter((a) => {
      if (typeFilter !== "all" && a.type !== typeFilter) return false;
      if (!q) return true;
      return (
        (a.subject ?? "").toLowerCase().includes(q) ||
        (a.body ?? "").toLowerCase().includes(q) ||
        (a.organizations?.name ?? "").toLowerCase().includes(q) ||
        (a.logged_by ?? "").toLowerCase().includes(q)
      );
    });
  }, [data, search, typeFilter]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activities…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="lg:w-44">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {types.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="font-body text-xs text-muted-foreground mt-3">
            {isLoading
              ? "Loading…"
              : `${filtered.length} activities (latest 500)`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {filtered.length === 0 && !isLoading ? (
            <p className="text-center text-muted-foreground py-8">
              No activities yet. Calls, emails, and SMS will land here once Slack/Twilio
              are connected.
            </p>
          ) : (
            <div className="space-y-3">
              {filtered.map((a) => {
                const Icon = TYPE_ICONS[a.type ?? ""] ?? StickyNote;
                return (
                  <div
                    key={a.id}
                    className="flex gap-3 border-l-2 border-primary/40 pl-3 py-1"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground capitalize">
                          {a.type ?? "note"}
                        </span>
                        {a.direction && <span>· {a.direction}</span>}
                        {a.organizations?.name && (
                          <span className="text-primary">
                            · {a.organizations.name}
                          </span>
                        )}
                        {a.occurred_at && (
                          <span>· {new Date(a.occurred_at).toLocaleString()}</span>
                        )}
                        {a.logged_by && <span>· by {a.logged_by}</span>}
                      </div>
                      {a.subject && (
                        <p className="font-semibold text-foreground text-sm mt-0.5">
                          {a.subject}
                        </p>
                      )}
                      {a.body && (
                        <p className="text-sm text-muted-foreground mt-0.5 whitespace-pre-wrap">
                          {a.body}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminActivities;
