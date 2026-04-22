import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Mail, Phone, Building2, CheckCircle2, AlertCircle } from "lucide-react";
import SmsConsent from "@/components/SmsConsent";

const sponsorSchema = z.object({
  company_name: z.string().trim().min(1, "Sponsor name is required").max(200),
  contact_name: z.string().trim().min(1, "Contact name is required").max(200),
  email: z.string().trim().email("Valid email is required").max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  address_line1: z.string().trim().max(255).optional().or(z.literal("")),
  address_line2: z.string().trim().max(255).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  state: z.string().trim().max(50).optional().or(z.literal("")),
  zip: z.string().trim().max(20).optional().or(z.literal("")),
  sponsorship_level_id: z.string().min(1, "Please select a sponsorship level"),
  preferred_venue: z.string().trim().max(200).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  sms_opt_in: z.boolean().default(true),
});

type SponsorFormData = z.infer<typeof sponsorSchema>;

const SponsorApply = () => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const { data: levels, isLoading: levelsLoading } = useQuery({
    queryKey: ["sponsorship-levels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sponsorship_levels")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<SponsorFormData>({
    resolver: zodResolver(sponsorSchema),
    defaultValues: {
      company_name: "",
      contact_name: "",
      email: "",
      phone: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      zip: "",
      sponsorship_level_id: "",
      preferred_venue: "",
      notes: "",
      sms_opt_in: true,
    },
  });

  const selectedLevelId = form.watch("sponsorship_level_id");

  const onSubmit = async (values: SponsorFormData) => {
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-sponsor-checkout", {
        body: {
          ...values,
          sms_opt_in_url: window.location.href,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error("Sponsor checkout error:", err);
      toast({
        title: "Submission failed",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setSubmitting(false);
    }
  };

  const searchParams = new URLSearchParams(window.location.search);
  const isSuccess = searchParams.get("success") === "true";

  if (isSuccess) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="font-display font-black text-foreground text-3xl mb-3">Thank You!</h1>
            <p className="font-body text-muted-foreground text-lg">
              Your sponsorship payment has been received. We'll be in touch with your tickets and event details.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Compact hero info */}
          <div className="text-center mb-4">
            <h1 className="font-display font-black text-foreground text-3xl md:text-4xl mb-1">
              Become a Sponsor
            </h1>
            <p className="font-body text-muted-foreground text-sm max-w-xl mx-auto">
              37th Annual CB Extravaganza — September 6, 2025 — Celebrating 150 years of Christian Brothers legacy
            </p>
          </div>

          {/* Compact benefits bar */}
          <section className="mb-6 grid md:grid-cols-4 gap-3">
            <div className="bg-card border border-border rounded-lg p-3">
              <h2 className="font-display font-bold text-xs text-foreground mb-1">Recognition</h2>
              <p className="font-body text-muted-foreground text-[11px]">Website, magazine (14,000 homes), email campaigns (8,000+)</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-3">
              <h2 className="font-display font-bold text-xs text-foreground mb-1">Event Perks</h2>
              <p className="font-body text-muted-foreground text-[11px]">VIP tickets, parking, early access to Private Reserve area</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-3">
              <h2 className="font-display font-bold text-xs text-foreground mb-1">Branding</h2>
              <p className="font-body text-muted-foreground text-[11px]">Logo on glassware, banners, napkins (by level)</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-3">
              <h2 className="font-display font-bold text-xs text-foreground mb-1">501(c)(3)</h2>
              <p className="font-body text-muted-foreground text-[11px]">Tax-deductible — Fed. Tax ID # 68-0322360</p>
            </div>
          </section>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-border" />
            <span className="font-display font-bold text-lg text-foreground">Sponsorship Application</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Sponsorship Level Selection */}
              <div className="space-y-3">
                <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" /> Select Sponsorship Level *
                </h3>

                {levelsLoading ? (
                  <p className="font-body text-muted-foreground text-sm">Loading sponsorship levels...</p>
                ) : (
                  <FormField
                    control={form.control}
                    name="sponsorship_level_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {levels?.map((level) => {
                              const soldOut = level.remaining_available <= 0;
                              const isSelected = field.value === level.id;
                              return (
                                <button
                                  key={level.id}
                                  type="button"
                                  disabled={soldOut}
                                  onClick={() => !soldOut && field.onChange(level.id)}
                                  className={`relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all ${
                                    soldOut
                                      ? "border-border bg-muted opacity-60 cursor-not-allowed"
                                      : isSelected
                                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                      : "border-border bg-card hover:border-primary/40 cursor-pointer"
                                  }`}
                                >
                                  {/* SOLD OUT stamp */}
                                  {soldOut && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                      <span className="font-display font-black text-2xl text-destructive/70 border-4 border-destructive/70 rounded-lg px-4 py-1 -rotate-12 uppercase tracking-wider">
                                        Sold Out
                                      </span>
                                    </div>
                                  )}

                                  <div className="flex justify-between items-start mb-1">
                                    <span className="font-display font-bold text-sm text-foreground">{level.name}</span>
                                    <span className="font-display font-black text-lg text-primary">
                                      ${Number(level.amount).toLocaleString()}
                                    </span>
                                  </div>
                                  {level.description && (
                                    <p className="font-body text-muted-foreground text-xs mb-2">{level.description}</p>
                                  )}
                                  <div className="flex gap-3 font-body text-xs text-muted-foreground">
                                    <span>{level.tickets_included} tickets</span>
                                    <span>{level.parking_included} parking</span>
                                    {!soldOut && (
                                      <span className="ml-auto text-primary font-semibold">
                                        {level.remaining_available} of {level.total_available} left
                                      </span>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Venue preference for Venue Sponsor */}
                {levels?.find((l) => l.id === selectedLevelId)?.name === "Venue Sponsor" && (
                  <FormField
                    control={form.control}
                    name="preferred_venue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-body">Preferred Venue</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Wine Courtyard, Beer Garden, Cigar Lounge, Whiskey Lounge" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Sponsor Info */}
              <div className="space-y-4">
                <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" /> Sponsor Information
                </h3>

                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-body">Sponsor / Company Name * <span className="text-xs text-muted-foreground font-normal">(as you'd like it to appear in materials)</span></FormLabel>
                      <FormControl><Input placeholder="Company name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-body">Contact Name *</FormLabel>
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
                        <FormLabel className="font-body">Email * <span className="text-xs text-muted-foreground font-normal">(tickets sent here)</span></FormLabel>
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
                        <FormLabel className="font-body">Phone</FormLabel>
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

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-body">Additional Notes</FormLabel>
                    <FormControl><Textarea rows={3} placeholder="Anything else you'd like us to know?" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Artwork reminder */}
              <div className="bg-muted rounded-lg p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="font-body text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground mb-1">Artwork Submission</p>
                  <p>Please send a high-resolution color logo (jpeg, png, pdf, or vector) to <a href="mailto:extravaganza@cbhs-sacramento.org" className="text-primary underline">extravaganza@cbhs-sacramento.org</a>. Wine & Whiskey Glass Sponsors: also send a black-and-white logo for glassware.</p>
                </div>
              </div>

              {/* Deadline reminder */}
              <p className="font-body text-xs text-muted-foreground text-center">
                To ensure inclusion in printed materials, please respond by <strong className="text-foreground">July 31, 2025</strong>.
              </p>

              <Button
                type="submit"
                size="lg"
                disabled={submitting || !selectedLevelId}
                className="w-full rounded-full font-body font-bold text-lg"
              >
                {submitting ? "Processing..." : "Continue to Payment"}
              </Button>

              <p className="font-body text-xs text-muted-foreground text-center">
                Accepts credit card and ACH bank transfer. You'll be redirected to our secure payment page.
              </p>
            </form>
          </Form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SponsorApply;
