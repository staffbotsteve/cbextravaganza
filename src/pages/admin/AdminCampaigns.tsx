import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Send, Search, MessageSquare } from "lucide-react";
import { toast } from "sonner";

type Contact = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  sms_opt_in: boolean;
  org_id: string | null;
  organizations: { id: string; name: string } | null;
};

type Campaign = {
  id: string;
  name: string;
  body: string;
  status: string;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  replied_count: number;
  sent_at: string | null;
  created_at: string;
};

const AdminCampaigns = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [name, setName] = useState("");
  const [body, setBody] = useState("Hi {{first_name}}, this is CB Extravaganza. ");
  const [fromNumber, setFromNumber] = useState(
    () => localStorage.getItem("twilio_from") ?? "",
  );
  const [sending, setSending] = useState(false);

  useEffect(() => {
    localStorage.setItem("twilio_from", fromNumber);
  }, [fromNumber]);

  const { data: contacts } = useQuery({
    queryKey: ["sms-contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select(
          "id, first_name, last_name, phone, sms_opt_in, org_id, organizations:org_id(id,name)",
        )
        .eq("sms_opt_in", true)
        .not("phone", "is", null)
        .order("last_name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Contact[];
    },
  });

  const { data: campaigns } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select(
          "id,name,body,status,total_recipients,sent_count,failed_count,replied_count,sent_at,created_at",
        )
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as Campaign[];
    },
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return contacts ?? [];
    return (contacts ?? []).filter((c) => {
      const n = [c.first_name, c.last_name].filter(Boolean).join(" ").toLowerCase();
      return (
        n.includes(q) ||
        (c.phone ?? "").includes(q) ||
        (c.organizations?.name ?? "").toLowerCase().includes(q)
      );
    });
  }, [contacts, search]);

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((c) => c.id)));
  };

  const preview = useMemo(() => {
    const first = filtered.find((c) => selected.has(c.id));
    if (!first) return body;
    return body
      .replace(/\{\{\s*first_name\s*\}\}/gi, first.first_name ?? "")
      .replace(/\{\{\s*last_name\s*\}\}/gi, first.last_name ?? "")
      .replace(/\{\{\s*org_name\s*\}\}/gi, first.organizations?.name ?? "");
  }, [body, filtered, selected]);

  const handleSend = async () => {
    if (!fromNumber) {
      toast.error("Enter your Twilio sending number first");
      return;
    }
    if (!body.trim()) {
      toast.error("Message body is required");
      return;
    }
    if (selected.size === 0) {
      toast.error("Select at least one recipient");
      return;
    }
    if (
      !confirm(
        `Send this SMS to ${selected.size} recipient(s)? This cannot be undone.`,
      )
    )
      return;

    setSending(true);
    try {
      const recipients = (contacts ?? [])
        .filter((c) => selected.has(c.id) && c.phone)
        .map((c) => ({
          contact_id: c.id,
          org_id: c.org_id,
          phone: c.phone!,
          first_name: c.first_name,
          last_name: c.last_name,
          org_name: c.organizations?.name ?? null,
        }));

      const { data, error } = await supabase.functions.invoke(
        "send-sms-campaign",
        {
          body: {
            name: name || `SMS ${new Date().toLocaleString()}`,
            body,
            from: fromNumber,
            recipients,
          },
        },
      );
      if (error) throw error;
      toast.success(
        `Campaign sent: ${data.sent} delivered, ${data.failed} failed`,
      );
      setSelected(new Set());
      setName("");
      qc.invalidateQueries({ queryKey: ["campaigns"] });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            New SMS Campaign
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="from">From (Twilio number, E.164)</Label>
              <Input
                id="from"
                value={fromNumber}
                onChange={(e) => setFromNumber(e.target.value)}
                placeholder="+15551234567"
              />
            </div>
            <div>
              <Label htmlFor="name">Campaign name (internal)</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Reminder — vendor form due Friday"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="body">
              Message body — supports {"{{first_name}}"}, {"{{last_name}}"},{" "}
              {"{{org_name}}"}
            </Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              maxLength={1600}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {body.length}/1600 chars · ~{Math.ceil(body.length / 160)} segment
              (s)
            </p>
          </div>
          {selected.size > 0 && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-xs font-semibold mb-1">
                Preview (first recipient):
              </p>
              <p className="text-sm whitespace-pre-wrap">{preview}</p>
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {selected.size} recipient(s) selected
            </p>
            <Button onClick={handleSend} disabled={sending || selected.size === 0}>
              <Send className="h-4 w-4 mr-2" />
              {sending ? "Sending…" : `Send to ${selected.size}`}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">
            Recipients (opted-in contacts with phone)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by name, phone, or organization…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="max-h-[400px] overflow-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={
                        filtered.length > 0 && selected.size === filtered.length
                      }
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Checkbox
                        checked={selected.has(c.id)}
                        onCheckedChange={() => toggle(c.id)}
                      />
                    </TableCell>
                    <TableCell className="font-semibold">
                      {[c.first_name, c.last_name].filter(Boolean).join(" ") ||
                        "(no name)"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {c.organizations?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm">{c.phone}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-6"
                    >
                      No opted-in contacts with phone numbers.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Recent campaigns</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Failed</TableHead>
                <TableHead>Replied</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(campaigns ?? []).map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-semibold">{c.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{c.status}</Badge>
                  </TableCell>
                  <TableCell>{c.total_recipients}</TableCell>
                  <TableCell>{c.sent_count}</TableCell>
                  <TableCell>{c.failed_count}</TableCell>
                  <TableCell>{c.replied_count}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(c.sent_at ?? c.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
              {(campaigns ?? []).length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-6"
                  >
                    No campaigns yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCampaigns;
