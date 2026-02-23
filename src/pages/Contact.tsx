import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h1 className="font-display font-black text-foreground text-4xl md:text-5xl mb-3">Contact Us</h1>
            <p className="font-body text-muted-foreground text-lg max-w-xl mx-auto">
              Have questions about the Extravaganza? We'd love to hear from you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div>
              <h3 className="font-display font-bold text-xl mb-6">Send a Message</h3>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="name" className="font-body">Name</Label>
                  <Input id="name" placeholder="Your name" className="font-body" />
                </div>
                <div>
                  <Label htmlFor="email" className="font-body">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" className="font-body" />
                </div>
                <div>
                  <Label htmlFor="message" className="font-body">Message</Label>
                  <Textarea id="message" placeholder="Your message..." rows={5} className="font-body" />
                </div>
                <Button type="submit" className="rounded-full font-body font-bold w-full">Send Message</Button>
              </form>
            </div>

            <div className="space-y-6">
              <h3 className="font-display font-bold text-xl mb-6">Get in Touch</h3>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-body font-bold text-foreground">Email</p>
                  <p className="font-body text-muted-foreground text-sm">extravaganza@cbhs.org</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-body font-bold text-foreground">Phone</p>
                  <p className="font-body text-muted-foreground text-sm">(901) 261-4900</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-body font-bold text-foreground">Address</p>
                  <p className="font-body text-muted-foreground text-sm">
                    Christian Brothers High School<br />
                    5900 Walnut Grove Rd<br />
                    Memphis, TN 38120
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
