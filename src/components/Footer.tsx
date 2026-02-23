import { Link } from "react-router-dom";
import { Wine, GlassWater, UtensilsCrossed } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5 text-primary">
                <Wine className="h-5 w-5" />
                <GlassWater className="h-5 w-5" />
                <UtensilsCrossed className="h-5 w-5" />
              </div>
              <span className="font-display font-bold text-lg">CB Extravaganza</span>
            </div>
            <p className="font-body text-secondary-foreground/60 text-sm leading-relaxed">
              Celebrating 150 years of Christian Brothers tradition. All proceeds benefit the CBHS Tuition Assistance Fund.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold mb-4">Quick Links</h4>
            <div className="space-y-2 font-body text-sm">
              <Link to="/tickets" className="block text-secondary-foreground/70 hover:text-primary transition-colors">Tickets</Link>
              <Link to="/vendors" className="block text-secondary-foreground/70 hover:text-primary transition-colors">Vendors</Link>
              <Link to="/sponsors" className="block text-secondary-foreground/70 hover:text-primary transition-colors">Sponsors</Link>
              <Link to="/get-involved" className="block text-secondary-foreground/70 hover:text-primary transition-colors">Get Involved</Link>
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold mb-4">Contact</h4>
            <div className="space-y-2 font-body text-sm text-secondary-foreground/70">
              <p>Christian Brothers High School</p>
              <p>Memphis, TN</p>
              <p>extravaganza@cbhs.org</p>
            </div>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-body text-secondary-foreground/40 text-xs">
            © {new Date().getFullYear()} Christian Brothers High School. All rights reserved.
          </p>
          <Link to="/admin/login" className="font-body text-secondary-foreground/40 text-xs hover:text-primary transition-colors">
            Admin Login
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
