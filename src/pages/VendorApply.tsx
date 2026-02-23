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
  Phone,
  CheckCircle2,
} from "lucide-react";

const vendorSchema = z.object({
  company_name: z.string().trim().min(1, "Vendor / company name is required").max(200),
  vendor_type: z.string().min(1, "Please select a category"),
  contact_name: z.string().trim().min(1, "Contact person is required").max(200),
  email: z.string().trim().email("Valid email is required").max(255),
  phone: z.string().trim().min(1, "Phone number is required").max(30),
  address_line1: z.string().trim().max(255).optional().or(z.literal("")),
  address_line2: z.string().trim().max(255).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  state: z.string().trim().max(50).optional().or(z.literal("")),
  zip: z.string().trim().max(20).optional().or(z.literal("")),
  location_preference: z.string().optional(),
  needs_electricity: z.boolean().default(false),
  needs_tent: z.boolean().default(false),
  volunteers_needed: z.number().int().min(0).max(10).default(0),
  past_participation: z.string().trim().max(200).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

type VendorFormData = z.infer<typeof vendorSchema>;

const VendorApply = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      company_name: "",
      vendor_type: "",
      contact_name: "",
      email: "",
      phone: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      zip: "",
      location_preference: "no_preference",
      needs_electricity: false,
      needs_tent: false,
      volunteers_needed: 0,
      past_participation: "",
      notes: "",
    },
  });

  const onSubmit = async (values: VendorFormData) => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from("vendors").insert({
        company_name: values.company_name,
        vendor_type: values.vendor_type,
        contact_name: values.contact_name,
        email: values.email,
        phone: values.phone,
        address_line1: values.address_line1 || null,
        address_line2: values.address_line2 || null,
        city: values.city || null,
        state: values.state || null,
        zip: values.zip || null,
        location_preference: values.location_preference || null,
        needs_electricity: values.needs_electricity,
        needs_tent: values.needs_tent,
        volunteers_needed: values.volunteers_needed,
        past_participation: values.past_participation || null,
        notes: values.notes || null,
        status: "Form Received",
      });

      setSubmitting(false);

      if (error) {
        console.error("Vendor insert error:", error);
        toast({
          title: "Submission failed",
          description: error.message || "Something went wrong. Please try again or contact us directly.",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Application received!", description: "Thank you — we'll be in touch soon." });
      navigate("/vendors");
    } catch (err) {
      console.error("Vendor submit exception:", err);
      setSubmitting(false);
      toast({
        title: "Submission failed",
        description: "Something went wrong. Please try again or contact us directly.",
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
          <div className="text-center mb-12">
            <h1 className="font-display font-black text-foreground text-4xl md:text-5xl mb-3">
              Become a Vendor
            </h1>
            <p className="font-body text-muted-foreground text-lg max-w-xl mx-auto">
              Join Sacramento's best restaurants, wineries, and breweries at the 37th Annual
              Christian Brothers Extravaganza — Saturday, September 6, 2025.
            </p>
          </div>

          {/* Info sections */}
          <section className="mb-12 space-y-8">
            <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-4">
              <h2 className="font-display font-bold text-2xl text-foreground">What We Ask</h2>
              <ul className="font-body text-muted-foreground space-y-2 list-disc list-inside">
                <li>Provide approximately <strong className="text-foreground">300 small bites or tastes</strong> (mini sliders, charcuterie samples, dessert bites, etc.).</li>
                <li>Wine: recommend 1–2 oz pours; minimum 2 cases / 24 bottles.</li>
                <li>Beer / cider / seltzer: recommend 3–4 oz pours.</li>
                <li>We prefer <strong className="text-foreground">2–4 servers</strong> for face-to-face guest interaction. If you can only donate product, volunteers will help serve.</li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-4">
              <h2 className="font-display font-bold text-2xl text-foreground">What We Provide</h2>
              <ul className="font-body text-muted-foreground space-y-2 list-disc list-inside">
                <li>8 ft table with linens</li>
                <li>Large beverage tub with ice</li>
                <li>Paper products for serving</li>
                <li>Guests bring their own event glassware</li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-4">
              <h2 className="font-display font-bold text-2xl text-foreground">Event Details</h2>
              <ul className="font-body text-muted-foreground space-y-2 list-disc list-inside">
                <li><strong className="text-foreground">Date:</strong> Saturday, September 6, 2025</li>
                <li><strong className="text-foreground">Hours:</strong> 5:30 PM – 10:00 PM</li>
                <li><strong className="text-foreground">VIP Early Access:</strong> 5:30 – 7:00 PM (~400 VIP guests)</li>
                <li><strong className="text-foreground">General Admission:</strong> 7:00 PM (1,600+ guests)</li>
                <li><strong className="text-foreground">Setup:</strong> As early as 2:00 PM</li>
                <li><strong className="text-foreground">Location:</strong> Christian Brothers High School, 4315 MLK Jr. Blvd, Sacramento, CA 95820</li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-4">
              <h2 className="font-display font-bold text-2xl text-foreground">Vendor Benefits</h2>
              <ul className="font-body text-muted-foreground space-y-2 list-disc list-inside">
                <li>Showcase your business to <strong className="text-foreground">2,000+ attendees</strong></li>
                <li>Featured in school magazine mailed to <strong className="text-foreground">14,500 homes</strong></li>
                <li>Included in email campaigns reaching <strong className="text-foreground">10,000+ people</strong></li>
                <li>Website listing with link to your site</li>
                <li>Instagram collaboration opportunity @cbextravaganza</li>
                <li>Distribute menus, business cards, and promotional materials</li>
              </ul>
            </div>
          </section>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-10">
            <div className="h-px flex-1 bg-border" />
            <span className="font-display font-bold text-xl text-foreground">Vendor Application</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Company info */}
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <FormLabel className="font-body">Address</FormLabel>
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

              {/* Event preferences */}
              <div className="space-y-4">
                <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" /> Event Preferences
                </h3>

                <FormField
                  control={form.control}
                  name="location_preference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-body">Venue Preference</FormLabel>
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

                <div className="grid sm:grid-cols-3 gap-4">
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
                            <Zap className="h-4 w-4 text-primary" /> Electricity needed
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
                            <Tent className="h-4 w-4 text-primary" /> Bringing a tent
                          </FormLabel>
                          <p className="text-xs text-muted-foreground font-body">Max 10' × 10'</p>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="volunteers_needed"
                    render={({ field }) => (
                      <FormItem className="rounded-lg border border-border p-4">
                        <FormLabel className="font-body flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-primary" /> Volunteers needed
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={10}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Additional */}
              <div className="space-y-4">
                <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" /> Additional Details
                </h3>

                <FormField
                  control={form.control}
                  name="past_participation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-body">Past Participation</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. First-time participant, or 5 years" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-body">Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Product description, special equipment needs, day-of staff names, or anything else we should know..."
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
                Questions? Contact us at{" "}
                <a href="mailto:extravaganza@cbhs-sacramento.org" className="text-primary underline">
                  extravaganza@cbhs-sacramento.org
                </a>{" "}
                or call (916) 733-3608.
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
