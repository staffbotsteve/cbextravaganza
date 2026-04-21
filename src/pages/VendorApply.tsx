import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wine,
  Beer,
  UtensilsCrossed,
  Users,
  Zap,
  Tent,
  MapPin,
  Mail,
  CheckCircle2,
  Package,
} from "lucide-react";

const EVENT_YEAR = 2026;

const vendorSchema = z.object({
  company_name: z.string().trim().min(1, "Vendor / company name is required").max(200),
  vendor_type: z.enum(["wine", "beer", "food", "other"], {
    errorMap: () => ({ message: "Please select a category" }),
  }),
  participation: z.enum(["yes", "donate_only"]).default("yes"),
  product_description: z.string().trim().max(1000).optional().or(z.literal("")),
  wine_quantity: z.string().trim().max(100).optional().or(z.literal("")),
  other_beverage_quantity: z.string().trim().max(100).optional().or(z.literal("")),
  contact_name: z.string().trim().min(1, "Contact person is required").max(200),
  email: z.string().trim().email("Valid email is required").max(255),
  phone: z.string().trim().min(1, "Phone number is required").max(30),
  address_line1: z.string().trim().max(255).optional().or(z.literal("")),
  address_line2: z.string().trim().max(255).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  state: z.string().trim().max(50).optional().or(z.literal("")),
  zip: z.string().trim().max(20).optional().or(z.literal("")),
  rep_1: z.string().trim().max(100).optional().or(z.literal("")),
  rep_2: z.string().trim().max(100).optional().or(z.literal("")),
  rep_3: z.string().trim().max(100).optional().or(z.literal("")),
  rep_4: z.string().trim().max(100).optional().or(z.literal("")),
  location_preference: z.string().optional(),
  needs_electricity: z.boolean().default(false),
  needs_tent: z.boolean().default(false),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

type VendorFormData = z.infer<typeof vendorSchema>;

const VENDOR_TYPE_TO_ORG_TYPE: Record<string, string> = {
  wine: "Wine",
  beer: "Beer / Cider",
  food: "Restaurant",
  other: "Other Vendor",
};

const VendorApply = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      company_name: "",
      vendor_type: undefined as unknown as VendorFormData["vendor_type"],
      participation: "yes",
      product_description: "",
      wine_quantity: "",
      other_beverage_quantity: "",
      contact_name: "",
      email: "",
      phone: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      zip: "",
      rep_1: "",
      rep_2: "",
      rep_3: "",
      rep_4: "",
      location_preference: "no_preference",
      needs_electricity: false,
      needs_tent: false,
      notes: "",
    },
  });

  const participation = form.watch("participation");
  const vendorType = form.watch("vendor_type");

  const onSubmit = async (values: VendorFormData) => {
    setSubmitting(true);
    try {
      const reps = [values.rep_1, values.rep_2, values.rep_3, values.rep_4]
        .map((r) => r?.trim())
        .filter((r): r is string => !!r);

      const orgName = values.company_name.trim();
      const orgType = VENDOR_TYPE_TO_ORG_TYPE[values.vendor_type];

      // 1) Upsert organization (case-insensitive name match)
      const { data: existingOrg, error: orgLookupErr } = await supabase
        .from("organizations")
        .select("id")
        .ilike("name", orgName)
        .maybeSingle();

      if (orgLookupErr) throw orgLookupErr;

      const orgPayload = {
        name: orgName,
        type: orgType,
        email: values.email,
        address_line1: values.address_line1 || null,
        address_line2: values.address_line2 || null,
        city: values.city || null,
        state: values.state || "CA",
        zip: values.zip || null,
      };

      let orgId: string;
      if (existingOrg?.id) {
        const { error } = await supabase
          .from("organizations")
          .update(orgPayload)
          .eq("id", existingOrg.id);
        if (error) throw error;
        orgId = existingOrg.id;
      } else {
        const { data, error } = await supabase
          .from("organizations")
          .insert(orgPayload)
          .select("id")
          .single();
        if (error) throw error;
        orgId = data.id;
      }

      // 2) Upsert primary contact (match by email within this org)
      const [firstName, ...lastParts] = values.contact_name.trim().split(/\s+/);
      const lastName = lastParts.join(" ") || null;

      const { data: existingContact } = await supabase
        .from("contacts")
        .select("id")
        .eq("org_id", orgId)
        .ilike("email", values.email)
        .maybeSingle();

      const contactPayload = {
        org_id: orgId,
        first_name: firstName || null,
        last_name: lastName,
        email: values.email,
        phone: values.phone,
        is_primary: true,
      };

      if (existingContact?.id) {
        await supabase.from("contacts").update(contactPayload).eq("id", existingContact.id);
      } else {
        await supabase.from("contacts").insert(contactPayload);
      }

      // 3) Upsert participation row for this year + role=vendor
      const { data: existingPart } = await supabase
        .from("participation")
        .select("id")
        .eq("org_id", orgId)
        .eq("year", EVENT_YEAR)
        .eq("role", "vendor")
        .maybeSingle();

      const participationPayload = {
        org_id: orgId,
        year: EVENT_YEAR,
        role: "vendor",
        vendor_type: values.vendor_type,
        donate_only: values.participation === "donate_only",
        product_description: values.product_description || null,
        wine_quantity: values.wine_quantity || null,
        other_beverage_quantity: values.other_beverage_quantity || null,
        representatives: reps.length > 0 ? reps : null,
        preferred_venue:
          values.vendor_type === "food" && values.participation === "yes"
            ? values.location_preference === "no_preference"
              ? null
              : values.location_preference || null
            : null,
        electric: values.participation === "yes" ? values.needs_electricity : null,
        tent: values.participation === "yes" ? values.needs_tent : null,
        owner_name: values.contact_name,
        status: values.participation === "yes" ? "Form Received" : "Donation Only",
      };

      if (existingPart?.id) {
        const { error } = await supabase
          .from("participation")
          .update(participationPayload)
          .eq("id", existingPart.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("participation").insert(participationPayload);
        if (error) throw error;
      }

      // 4) Optional: free-form notes attached to the org
      if (values.notes?.trim()) {
        await supabase.from("activities").insert({
          org_id: orgId,
          type: "form_note",
          subject: `Vendor form note (${EVENT_YEAR})`,
          body: values.notes.trim(),
          direction: "inbound",
        });
      }

      // 5) Send confirmation email (fire-and-forget)
      supabase.functions
        .invoke("send-vendor-confirmation", {
          body: {
            vendor_email: values.email,
            vendor_name: values.contact_name,
            company_name: values.company_name,
            is_update: !!existingPart?.id,
          },
        })
        .catch((emailErr) => console.error("Email send error:", emailErr));

      setSubmitting(false);
      toast({
        title: "Application received!",
        description: existingPart?.id
          ? "Welcome back! Your vendor information has been updated."
          : "Thank you — we'll be in touch soon.",
      });
      navigate("/vendors");
    } catch (err) {
      console.error("Vendor submit exception:", err);
      setSubmitting(false);
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      toast({
        title: "Submission failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Hero header */}
          <div className="text-center mb-6">
            <h1 className="font-display font-black text-foreground text-3xl md:text-4xl mb-2">
              Become a Vendor
            </h1>
            <p className="font-body text-muted-foreground text-sm max-w-xl mx-auto">
              Join Sacramento's best restaurants, wineries, and breweries at the 37th Annual
              Christian Brothers Extravaganza — Saturday, September 12, 2026.
            </p>
          </div>

          {/* Info sections */}
          <section className="mb-8 grid md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-xl p-4 space-y-2">
              <h2 className="font-display font-bold text-sm text-foreground">What We Ask</h2>
              <ul className="font-body text-muted-foreground space-y-1 list-disc list-inside text-xs">
                <li><strong className="text-foreground">~300 small bites/tastes</strong></li>
                <li>Wine: 1–2 oz pours; min 2 cases</li>
                <li>Beer/cider: 3–4 oz pours</li>
                <li>2–4 representatives at the table</li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 space-y-2">
              <h2 className="font-display font-bold text-sm text-foreground">What We Provide</h2>
              <ul className="font-body text-muted-foreground space-y-1 list-disc list-inside text-xs">
                <li>8 ft table with linens</li>
                <li>Large beverage tub with ice</li>
                <li>Paper products for serving</li>
                <li>Guests bring event glassware</li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 space-y-2">
              <h2 className="font-display font-bold text-sm text-foreground">Vendor Benefits</h2>
              <ul className="font-body text-muted-foreground space-y-1 list-disc list-inside text-xs">
                <li><strong className="text-foreground">2,000+</strong> attendees</li>
                <li>Magazine mailed to 14,500 homes</li>
                <li>Email campaigns to 10,000+</li>
                <li>Website listing & Instagram collab</li>
              </ul>
            </div>
          </section>

          <div className="flex items-center gap-4 mb-10">
            <div className="h-px flex-1 bg-border" />
            <span className="font-display font-bold text-xl text-foreground">Vendor Application</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Vendor info */}
              <div className="space-y-4">
                <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5 text-primary" /> Vendor Information
                </h3>

                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-body">Vendor / Company Name *</FormLabel>
                      <FormControl><Input placeholder="e.g. Sacramento Brewing Co." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vendor_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-body">Category *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="wine"><span className="flex items-center gap-2"><Wine className="h-4 w-4" /> Wine</span></SelectItem>
                          <SelectItem value="beer"><span className="flex items-center gap-2"><Beer className="h-4 w-4" /> Beer / Cider</span></SelectItem>
                          <SelectItem value="food"><span className="flex items-center gap-2"><UtensilsCrossed className="h-4 w-4" /> Restaurant / Caterer</span></SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Participation Yes / Donate-only */}
                <FormField
                  control={form.control}
                  name="participation"
                  render={({ field }) => (
                    <FormItem className="rounded-lg border border-border p-4 space-y-3">
                      <FormLabel className="font-body">Will you participate? *</FormLabel>
                      <FormControl>
                        <RadioGroup value={field.value} onValueChange={field.onChange} className="space-y-2">
                          <div className="flex items-start gap-2">
                            <RadioGroupItem value="yes" id="part-yes" className="mt-1" />
                            <Label htmlFor="part-yes" className="font-body cursor-pointer leading-snug">
                              <strong>YES!</strong> We will participate in the Christian Brothers Extravaganza on Saturday, September 12, 2026 at Christian Brothers High School
                            </Label>
                          </div>
                          <div className="flex items-start gap-2">
                            <RadioGroupItem value="donate_only" id="part-donate" className="mt-1" />
                            <Label htmlFor="part-donate" className="font-body cursor-pointer leading-snug">
                              <strong>No.</strong> We are not able to attend, but we will donate product for the event
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Product details */}
              <div className="space-y-4">
                <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" /> Product Details
                </h3>
                <p className="font-body text-muted-foreground text-xs -mt-2">
                  We ask each vendor to supply approximately 300 tastes. Please provide additional information below.
                </p>

                <FormField
                  control={form.control}
                  name="product_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-body">Product Description</FormLabel>
                      <FormControl><Textarea rows={3} placeholder="What you'll be serving / donating" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="wine_quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-body">WINE quantity estimate</FormLabel>
                        <FormControl><Input placeholder="e.g. 4 cases" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="other_beverage_quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-body">OTHER BEVERAGE quantity estimate</FormLabel>
                        <FormControl><Input placeholder="e.g. 2 kegs" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Contact info */}
              <div className="space-y-4">
                <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" /> Contact Information
                </h3>

                <FormField
                  control={form.control}
                  name="contact_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-body">Contact Person *</FormLabel>
                      <FormControl><Input placeholder="Full name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-body">Email *</FormLabel>
                        <FormControl><Input type="email" placeholder="you@company.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-body">Phone *</FormLabel>
                        <FormControl><Input type="tel" placeholder="(916) 555-1234" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address_line1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-body">Street Address</FormLabel>
                      <FormControl><Input placeholder="Street address" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address_line2"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl><Input placeholder="Suite, unit, etc. (optional)" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel className="font-body">City</FormLabel>
                        <FormControl><Input placeholder="Sacramento" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-body">State</FormLabel>
                        <FormControl><Input placeholder="CA" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-body">Zip</FormLabel>
                        <FormControl><Input placeholder="95820" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Representatives — only when attending */}
              {participation === "yes" && (
                <div className="space-y-4">
                  <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" /> Table Representatives
                  </h3>
                  <p className="font-body text-muted-foreground text-xs -mt-2">
                    Please provide the names of up to 4 representatives who will staff your table.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {([1, 2, 3, 4] as const).map((n) => (
                      <FormField
                        key={n}
                        control={form.control}
                        name={`rep_${n}` as "rep_1" | "rep_2" | "rep_3" | "rep_4"}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-body">Representative {n}</FormLabel>
                            <FormControl><Input placeholder="Full name" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Event preferences — only when attending */}
              {participation === "yes" && (
                <div className="space-y-4">
                  <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" /> Event Preferences
                  </h3>

                  {vendorType === "food" && (
                    <FormField
                      control={form.control}
                      name="location_preference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-body">FOOD Vendors: Venue Preference</FormLabel>
                          <FormControl>
                            <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-wrap gap-4">
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="Wine Courtyard" id="loc-wine" />
                                <Label htmlFor="loc-wine" className="font-body cursor-pointer">Wine Courtyard</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="Beer Garden" id="loc-beer" />
                                <Label htmlFor="loc-beer" className="font-body cursor-pointer">Beer Garden</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="no_preference" id="loc-none" />
                                <Label htmlFor="loc-none" className="font-body cursor-pointer">No Preference</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="needs_electricity"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-3 space-y-0 rounded-lg border border-border p-4">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div>
                            <FormLabel className="font-body flex items-center gap-1.5 cursor-pointer">
                              <Zap className="h-4 w-4 text-primary" /> Electricity Needed?
                            </FormLabel>
                            <p className="text-xs text-muted-foreground font-body">Limited 110v outlets</p>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="needs_tent"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-3 space-y-0 rounded-lg border border-border p-4">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div>
                            <FormLabel className="font-body flex items-center gap-1.5 cursor-pointer">
                              <Tent className="h-4 w-4 text-primary" /> Bringing a tent / canopy?
                            </FormLabel>
                            <p className="text-xs text-muted-foreground font-body">Max 10' × 10'</p>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Additional notes */}
              <div className="space-y-4">
                <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" /> Additional Notes
                </h3>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Special equipment needs, dietary info, or anything else we should know..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full rounded-full font-body font-bold h-12 text-base">
                {submitting ? "Submitting…" : "Submit Vendor Application"}
              </Button>

              <p className="text-center text-xs text-muted-foreground font-body">
                Thank you for joining us! Please be on the lookout for emails from{" "}
                <a href="mailto:extravaganza@cbhs-sacramento.org" className="text-primary underline">
                  extravaganza@cbhs-sacramento.org
                </a>{" "}
                for event details and directions.
              </p>
            </form>
          </Form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VendorApply;
