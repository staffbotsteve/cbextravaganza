import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Building2, Calendar, FileText } from "lucide-react";

interface Props {
  orgId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type OrgDetail = {
  id: string;
  name: string;
  type: string | null;
  website: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  notes: string | null;
  contacts: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
    is_primary: boolean | null;
    cb_connection: string | null;
  }[];
  participation: {
    id: string;
    year: number;
    role: string | null;
    status: string | null;
    owner_name: string | null;
    sponsor_tier: string | null;
    sponsor_value: number | null;
    payment_amount: number | null;
    payment_status: string | null;
    tent: boolean | null;
    electric: boolean | null;
    booth_zone: string | null;
    tickets_qty: number | null;
    parking_qty: number | null;
  }[];
  activities: {
    id: string;
    type: string | null;
    direction: string | null;
    subject: string | null;
    body: string | null;
    occurred_at: string | null;
    logged_by: string | null;
  }[];
  documents: {
    id: string;
    type: string | null;
    year: number | null;
    status: string | null;
    file_url: string | null;
    sent_at: string | null;
    signed_at: string | null;
  }[];
};

const OrgDetailDrawer = ({ orgId, open, onOpenChange }: Props) => {
  const { data: org, isLoading } = useQuery({
    queryKey: ["org-detail", orgId],
    queryFn: async () => {
      if (!orgId) return null;
      const { data, error } = await supabase
        .from("organizations")
        .select(
          `id, name, type, website, address_line1, address_line2, city, state, zip, notes,
           contacts (id, first_name, last_name, email, phone, is_primary, cb_connection),
           participation (id, year, role, status, owner_name, sponsor_tier, sponsor_value, payment_amount, payment_status, tent, electric, booth_zone, tickets_qty, parking_qty),
           activities (id, type, direction, subject, body, occurred_at, logged_by)`
        )
        .eq("id", orgId)
        .maybeSingle();
      if (error) throw error;
      const { data: docs } = await supabase
        .from("documents")
        .select("id, type, year, status, file_url, sent_at, signed_at")
        .eq("org_id", orgId);
      return { ...(data as Omit<OrgDetail, "documents">), documents: docs ?? [] } as OrgDetail;
    },
    enabled: !!orgId,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        {isLoading || !org ? (
          <div className="space-y-4 mt-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <SheetTitle className="font-display text-xl text-left">
                  {org.name}
                </SheetTitle>
              </div>
              <SheetDescription className="text-left">
                {org.type ?? "Organization"}
                {org.website && (
                  <>
                    {" · "}
                    <a
                      href={org.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      {org.website.replace(/^https?:\/\//, "")}
                    </a>
                  </>
                )}
              </SheetDescription>
            </SheetHeader>

            {/* Address */}
            {(org.address_line1 || org.city) && (
              <div className="mt-4 flex items-start gap-2 text-sm font-body text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  {org.address_line1 && <p>{org.address_line1}</p>}
                  {org.address_line2 && <p>{org.address_line2}</p>}
                  <p>
                    {[org.city, org.state, org.zip].filter(Boolean).join(", ")}
                  </p>
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Button size="sm" variant="outline" disabled>
                Log Call
              </Button>
              <Button size="sm" variant="outline" disabled>
                Send Email
              </Button>
              <Button size="sm" variant="outline" disabled>
                Send SMS
              </Button>
              <Button size="sm" variant="outline" disabled>
                Add Note
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Quick actions activate when Slack/Twilio are connected (Phase 4-5).
            </p>

            <Separator className="my-5" />

            {/* Contacts */}
            <Section title="Contacts" count={org.contacts.length}>
              {org.contacts.length === 0 ? (
                <Empty text="No contacts on file." />
              ) : (
                <div className="space-y-2">
                  {org.contacts.map((c) => (
                    <div
                      key={c.id}
                      className="border border-border rounded-lg p-3 bg-card"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-foreground text-sm">
                            {[c.first_name, c.last_name].filter(Boolean).join(" ") ||
                              "(no name)"}
                          </p>
                          {c.cb_connection && (
                            <p className="text-xs text-muted-foreground">
                              CB Connection: {c.cb_connection}
                            </p>
                          )}
                        </div>
                        {c.is_primary && (
                          <Badge variant="secondary" className="text-xs">
                            Primary
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs">
                        {c.email && (
                          <a
                            href={`mailto:${c.email}`}
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <Mail className="h-3 w-3" />
                            {c.email}
                          </a>
                        )}
                        {c.phone && (
                          <a
                            href={`tel:${c.phone}`}
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <Phone className="h-3 w-3" />
                            {c.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Participation history */}
            <Section title="Participation History" count={org.participation.length}>
              {org.participation.length === 0 ? (
                <Empty text="No participation records yet." />
              ) : (
                <div className="space-y-2">
                  {org.participation
                    .sort((a, b) => b.year - a.year)
                    .map((p) => (
                      <div
                        key={p.id}
                        className="border border-border rounded-lg p-3 bg-card text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold text-foreground">
                              {p.year}
                            </span>
                            <span className="text-muted-foreground">
                              {p.role ?? "—"}
                            </span>
                          </div>
                          {p.status && (
                            <Badge variant="outline">{p.status}</Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                          {p.owner_name && <span>Owner: {p.owner_name}</span>}
                          {p.sponsor_tier && <span>Tier: {p.sponsor_tier}</span>}
                          {p.sponsor_value != null && (
                            <span>
                              Committed: ${Number(p.sponsor_value).toLocaleString()}
                            </span>
                          )}
                          {p.payment_amount != null && (
                            <span>
                              Paid: ${Number(p.payment_amount).toLocaleString()}
                            </span>
                          )}
                          {p.booth_zone && <span>Zone: {p.booth_zone}</span>}
                          {p.tickets_qty != null && (
                            <span>Tickets: {p.tickets_qty}</span>
                          )}
                          {p.parking_qty != null && (
                            <span>Parking: {p.parking_qty}</span>
                          )}
                          {(p.tent || p.electric) && (
                            <span>
                              Needs:{" "}
                              {[p.tent && "tent", p.electric && "electric"]
                                .filter(Boolean)
                                .join(", ")}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </Section>

            {/* Activity timeline */}
            <Section title="Activity Timeline" count={org.activities.length}>
              {org.activities.length === 0 ? (
                <Empty text="No activities logged yet." />
              ) : (
                <div className="space-y-2">
                  {org.activities
                    .sort(
                      (a, b) =>
                        new Date(b.occurred_at ?? 0).getTime() -
                        new Date(a.occurred_at ?? 0).getTime()
                    )
                    .map((a) => (
                      <div
                        key={a.id}
                        className="border-l-2 border-primary/40 pl-3 py-1 text-sm"
                      >
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">
                            {a.type ?? "Note"}
                          </span>
                          {a.direction && <span>· {a.direction}</span>}
                          {a.occurred_at && (
                            <span>
                              · {new Date(a.occurred_at).toLocaleString()}
                            </span>
                          )}
                          {a.logged_by && <span>· by {a.logged_by}</span>}
                        </div>
                        {a.subject && (
                          <p className="font-semibold text-foreground mt-0.5">
                            {a.subject}
                          </p>
                        )}
                        {a.body && (
                          <p className="text-muted-foreground mt-0.5 whitespace-pre-wrap">
                            {a.body}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </Section>

            {/* Documents */}
            <Section title="Documents" count={org.documents.length}>
              {org.documents.length === 0 ? (
                <Empty text="No documents on file." />
              ) : (
                <div className="space-y-2">
                  {org.documents.map((d) => (
                    <div
                      key={d.id}
                      className="border border-border rounded-lg p-3 bg-card text-sm flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-semibold text-foreground">
                            {d.type ?? "Document"}
                            {d.year && (
                              <span className="text-muted-foreground font-normal ml-2">
                                ({d.year})
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {d.status ?? "—"}
                            {d.signed_at &&
                              ` · signed ${new Date(d.signed_at).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                      {d.file_url && (
                        <Button asChild size="sm" variant="outline">
                          <a href={d.file_url} target="_blank" rel="noreferrer">
                            Open
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {org.notes && (
              <Section title="Notes">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {org.notes}
                </p>
              </Section>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

const Section = ({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) => (
  <div className="mt-5">
    <div className="flex items-center justify-between mb-2">
      <h3 className="font-display font-bold text-sm text-foreground uppercase tracking-wide">
        {title}
      </h3>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground tabular-nums">
          {count}
        </span>
      )}
    </div>
    {children}
  </div>
);

const Empty = ({ text }: { text: string }) => (
  <p className="text-xs text-muted-foreground italic">{text}</p>
);

export default OrgDetailDrawer;
