import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Mail,
  Save,
  Trash2,
  MessageSquare,
  Activity as ActivityIcon,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import PhoneNumbersManager from "./PhoneNumbersManager";

interface Props {
  contactId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Org = { id: string; name: string };

type Contact = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  cb_connection: string | null;
  is_primary: boolean | null;
  sms_opt_in: boolean;
  sms_opt_in_at: string | null;
  sms_opt_in_source: string | null;
  org_id: string | null;
  created_at: string;
  organizations: Org | null;
};

type Activity = {
  id: string;
  type: string | null;
  direction: string | null;
  subject: string | null;
  body: string | null;
  occurred_at: string | null;
  logged_by: string | null;
};

type Message = {
  id: string;
  channel: string;
  direction: string;
  status: string | null;
  from_address: string | null;
  to_address: string | null;
  body: string | null;
  occurred_at: string;
  error: string | null;
};

const ContactDetailDrawer = ({ contactId, open, onOpenChange }: Props) => {
  const qc = useQueryClient();
  const [form, setForm] = useState<Partial<Contact>>({});
  const [saving, setSaving] = useState(false);
  const [newActivityType, setNewActivityType] = useState("note");
  const [newActivityBody, setNewActivityBody] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["contact-detail", contactId],
    queryFn: async () => {
      if (!contactId) return null;
      const { data, error } = await supabase
        .from("contacts")
        .select(
          "id, first_name, last_name, email, phone, cb_connection, is_primary, sms_opt_in, sms_opt_in_at, sms_opt_in_source, org_id, created_at, organizations:org_id(id,name)",
        )
        .eq("id", contactId)
        .single();
      if (error) throw error;
      return data as unknown as Contact;
    },
    enabled: !!contactId && open,
  });

  const { data: activities } = useQuery({
    queryKey: ["contact-activities", contactId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("id, type, direction, subject, body, occurred_at, logged_by")
        .eq("contact_id", contactId!)
        .order("occurred_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as Activity[];
    },
    enabled: !!contactId && open,
  });

  const { data: messages } = useQuery({
    queryKey: ["contact-messages", contactId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select(
          "id, channel, direction, status, from_address, to_address, body, occurred_at, error",
        )
        .eq("contact_id", contactId!)
        .order("occurred_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as Message[];
    },
    enabled: !!contactId && open,
  });

  const { data: orgs } = useQuery({
    queryKey: ["org-options"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("id, name")
        .order("name", { ascending: true })
        .limit(2000);
      if (error) throw error;
      return (data ?? []) as Org[];
    },
    enabled: open,
  });

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const update = <K extends keyof Contact>(k: K, v: Contact[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!contactId) return;
    setSaving(true);
    const { error } = await supabase
      .from("contacts")
      .update({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        cb_connection: form.cb_connection,
        is_primary: form.is_primary ?? false,
        sms_opt_in: form.sms_opt_in ?? true,
        org_id: form.org_id,
      })
      .eq("id", contactId);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Contact saved");
    qc.invalidateQueries({ queryKey: ["admin-contacts"] });
    qc.invalidateQueries({ queryKey: ["contact-detail", contactId] });
  };

  const handleDelete = async () => {
    if (!contactId) return;
    const { error } = await supabase.from("contacts").delete().eq("id", contactId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Contact deleted");
    qc.invalidateQueries({ queryKey: ["admin-contacts"] });
    onOpenChange(false);
  };

  const handleAddActivity = async () => {
    if (!contactId || !newActivityBody.trim()) return;
    const orgId = form.org_id ?? data?.org_id ?? null;
    if (!orgId) {
      toast.error("Contact has no organization — assign one first");
      return;
    }
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("activities").insert({
      org_id: orgId,
      contact_id: contactId,
      type: newActivityType,
      body: newActivityBody,
      subject:
        newActivityType.charAt(0).toUpperCase() + newActivityType.slice(1),
      logged_by: userData.user?.email ?? "admin",
      occurred_at: new Date().toISOString(),
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Activity logged");
    setNewActivityBody("");
    qc.invalidateQueries({ queryKey: ["contact-activities", contactId] });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        {isLoading || !data ? (
          <div className="space-y-3 pt-6">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32" />
          </div>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle className="font-display text-2xl">
                {[form.first_name, form.last_name].filter(Boolean).join(" ") ||
                  "Unnamed contact"}
              </SheetTitle>
              <SheetDescription className="flex items-center gap-2 flex-wrap">
                {data.organizations?.name && (
                  <span className="text-foreground">
                    {data.organizations.name}
                  </span>
                )}
                {form.is_primary && (
                  <Badge variant="secondary" className="text-xs">
                    Primary
                  </Badge>
                )}
                {form.sms_opt_in ? (
                  <Badge className="text-xs">SMS opt-in</Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    SMS opted out
                  </Badge>
                )}
              </SheetDescription>
            </SheetHeader>

            <Tabs defaultValue="details" className="mt-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="activity">
                  Activity ({activities?.length ?? 0})
                </TabsTrigger>
                <TabsTrigger value="messages">
                  Messages ({messages?.length ?? 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="first_name">First name</Label>
                    <Input
                      id="first_name"
                      value={form.first_name ?? ""}
                      onChange={(e) => update("first_name", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last name</Label>
                    <Input
                      id="last_name"
                      value={form.last_name ?? ""}
                      onChange={(e) => update("last_name", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email ?? ""}
                    onChange={(e) => update("email", e.target.value)}
                  />
                </div>

                <div>
                  <Label>Phone numbers</Label>
                  <div className="mt-2">
                    <PhoneNumbersManager contactId={contactId!} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="org">Organization</Label>
                  <Select
                    value={form.org_id ?? ""}
                    onValueChange={(v) => update("org_id", v || null)}
                  >
                    <SelectTrigger id="org">
                      <SelectValue placeholder="Select organization…" />
                    </SelectTrigger>
                    <SelectContent>
                      {(orgs ?? []).map((o) => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="cb">CB Connection</Label>
                  <Input
                    id="cb"
                    value={form.cb_connection ?? ""}
                    onChange={(e) => update("cb_connection", e.target.value)}
                    placeholder="e.g. parent of student '26"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={!!form.is_primary}
                      onCheckedChange={(v) => update("is_primary", !!v)}
                    />
                    Primary contact
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={form.sms_opt_in ?? true}
                      onCheckedChange={(v) => update("sms_opt_in", !!v)}
                    />
                    SMS opt-in
                  </label>
                </div>

                {data.sms_opt_in_at && (
                  <p className="text-xs text-muted-foreground">
                    SMS consent captured{" "}
                    {new Date(data.sms_opt_in_at).toLocaleString()}
                    {data.sms_opt_in_source && ` via ${data.sms_opt_in_source}`}
                  </p>
                )}

                <Separator />

                <div className="flex items-center justify-between gap-3">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this contact?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This permanently removes the contact. Activities and
                          messages will keep a reference but the contact name
                          will be lost.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Button onClick={handleSave} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving…" : "Save changes"}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4 pt-4">
                <div className="rounded-md border p-3 space-y-2 bg-muted/30">
                  <p className="font-semibold text-sm flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Log activity
                  </p>
                  <div className="flex gap-2">
                    <Select
                      value={newActivityType}
                      onValueChange={setNewActivityType}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="note">Note</SelectItem>
                        <SelectItem value="call">Call</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea
                      value={newActivityBody}
                      onChange={(e) => setNewActivityBody(e.target.value)}
                      placeholder="What happened?"
                      rows={2}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={handleAddActivity}
                      disabled={!newActivityBody.trim()}
                    >
                      Log
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {(activities ?? []).map((a) => (
                    <div
                      key={a.id}
                      className="rounded-md border p-3 space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {a.type ?? "activity"}
                          </Badge>
                          {a.direction && <span>· {a.direction}</span>}
                        </span>
                        <span>
                          {a.occurred_at
                            ? new Date(a.occurred_at).toLocaleString()
                            : ""}
                        </span>
                      </div>
                      {a.subject && (
                        <p className="font-semibold text-sm">{a.subject}</p>
                      )}
                      {a.body && (
                        <p className="text-sm whitespace-pre-wrap">{a.body}</p>
                      )}
                      {a.logged_by && (
                        <p className="text-xs text-muted-foreground">
                          by {a.logged_by}
                        </p>
                      )}
                    </div>
                  ))}
                  {(activities ?? []).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      <ActivityIcon className="h-5 w-5 mx-auto mb-2 opacity-50" />
                      No activity yet.
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="messages" className="space-y-3 pt-4">
                {(messages ?? []).map((m) => (
                  <div
                    key={m.id}
                    className={`rounded-md border p-3 space-y-1 ${
                      m.direction === "inbound" ? "bg-muted/40" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {m.channel}
                        </Badge>
                        <Badge
                          variant={
                            m.direction === "inbound" ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {m.direction}
                        </Badge>
                        {m.status && <span>· {m.status}</span>}
                      </span>
                      <span>{new Date(m.occurred_at).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {m.direction === "inbound"
                        ? `From ${m.from_address}`
                        : `To ${m.to_address}`}
                    </p>
                    {m.body && (
                      <p className="text-sm whitespace-pre-wrap">{m.body}</p>
                    )}
                    {m.error && (
                      <p className="text-xs text-destructive">⚠ {m.error}</p>
                    )}
                  </div>
                ))}
                {(messages ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    <MessageSquare className="h-5 w-5 mx-auto mb-2 opacity-50" />
                    No messages yet.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ContactDetailDrawer;
