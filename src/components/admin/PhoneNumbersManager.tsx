import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Phone, Plus, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

type PhoneType = "mobile" | "office" | "home" | "fax" | "other" | "unknown";

type ContactPhone = {
  id: string;
  contact_id: string;
  phone: string;
  phone_type: PhoneType;
  is_primary: boolean;
  sms_capable: boolean;
  last_sms_status: string | null;
  last_sms_error_code: string | null;
  last_checked_at: string | null;
};

interface Props {
  contactId: string;
}

const TYPE_LABELS: Record<PhoneType, string> = {
  mobile: "Mobile",
  office: "Office",
  home: "Home",
  fax: "Fax",
  other: "Other",
  unknown: "Unknown",
};

const PhoneNumbersManager = ({ contactId }: Props) => {
  const qc = useQueryClient();
  const [newPhone, setNewPhone] = useState("");
  const [newType, setNewType] = useState<PhoneType>("mobile");

  const { data: phones, isLoading } = useQuery({
    queryKey: ["contact-phones", contactId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_phones")
        .select("*")
        .eq("contact_id", contactId)
        .order("is_primary", { ascending: false })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ContactPhone[];
    },
  });

  const refresh = () =>
    qc.invalidateQueries({ queryKey: ["contact-phones", contactId] });

  const handleAdd = async () => {
    if (!newPhone.trim()) return;
    const { error } = await supabase.from("contact_phones").insert({
      contact_id: contactId,
      phone: newPhone.trim(),
      phone_type: newType,
      is_primary: (phones ?? []).length === 0,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setNewPhone("");
    setNewType("mobile");
    refresh();
  };

  const handleUpdate = async (
    id: string,
    patch: Partial<Omit<ContactPhone, "id" | "contact_id">>,
  ) => {
    const { error } = await supabase
      .from("contact_phones")
      .update(patch)
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    refresh();
  };

  const handleSetPrimary = async (id: string) => {
    // Clear other primaries, then set this one
    await supabase
      .from("contact_phones")
      .update({ is_primary: false })
      .eq("contact_id", contactId);
    await supabase
      .from("contact_phones")
      .update({ is_primary: true })
      .eq("id", id);
    refresh();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("contact_phones")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    refresh();
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading phones…</p>
        )}
        {!isLoading && (phones ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">
            No phone numbers yet.
          </p>
        )}
        {(phones ?? []).map((p) => {
          const isLandline =
            p.phone_type === "office" ||
            p.phone_type === "home" ||
            p.phone_type === "fax" ||
            !p.sms_capable;
          return (
            <div
              key={p.id}
              className="flex items-center gap-2 rounded-md border p-2 flex-wrap"
            >
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                value={p.phone}
                onChange={(e) =>
                  handleUpdate(p.id, { phone: e.target.value })
                }
                className="flex-1 min-w-[140px]"
              />
              <Select
                value={p.phone_type}
                onValueChange={(v) =>
                  handleUpdate(p.id, { phone_type: v as PhoneType })
                }
              >
                <SelectTrigger className="w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TYPE_LABELS) as PhoneType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <label className="flex items-center gap-1 text-xs">
                <Checkbox
                  checked={p.is_primary}
                  onCheckedChange={() => !p.is_primary && handleSetPrimary(p.id)}
                />
                Primary
              </label>
              {isLandline && (
                <Badge variant="outline" className="text-xs gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  No SMS
                </Badge>
              )}
              {p.last_sms_error_code && (
                <Badge variant="destructive" className="text-xs">
                  Err {p.last_sms_error_code}
                </Badge>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(p.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 rounded-md border border-dashed p-2 bg-muted/30">
        <Input
          value={newPhone}
          onChange={(e) => setNewPhone(e.target.value)}
          placeholder="+15551234567"
          className="flex-1"
        />
        <Select
          value={newType}
          onValueChange={(v) => setNewType(v as PhoneType)}
        >
          <SelectTrigger className="w-[110px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(TYPE_LABELS) as PhoneType[]).map((t) => (
              <SelectItem key={t} value={t}>
                {TYPE_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={handleAdd} disabled={!newPhone.trim()}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        SMS campaigns only send to <strong>Mobile</strong> or{" "}
        <strong>Unknown</strong> numbers. Landline detection from Twilio
        delivery results automatically reclassifies numbers as Office.
      </p>
    </div>
  );
};

export default PhoneNumbersManager;
