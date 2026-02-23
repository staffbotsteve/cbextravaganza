import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const SponsorsPreviewSection = () => {
  const { data: sponsors } = useQuery({
    queryKey: ["sponsors-preview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sponsors")
        .select("id, company_name, sponsorship_level")
        .eq("in_slideshow", true)
        .order("value", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: vendors } = useQuery({
    queryKey: ["vendors-preview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendors")
        .select("id, company_name")
        .in("status", ["Form Received", "Confirmed"])
        .order("company_name")
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const allNames = [
    ...(sponsors?.map((s) => s.company_name) ?? []),
    ...(vendors?.map((v) => v.company_name) ?? []),
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="font-display font-black text-foreground text-4xl md:text-5xl mb-3">
            Our Vendors & Sponsors
          </h2>
          <p className="font-body text-muted-foreground text-lg max-w-xl mx-auto">
            Sacramento's finest wineries, breweries, restaurants, and sponsors come together for one great cause.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          {allNames.slice(0, 30).map((name) => (
            <span
              key={name}
              className="bg-muted text-foreground font-body font-semibold text-sm px-4 py-2 rounded-full border border-border hover:border-primary/30 transition-colors"
            >
              {name}
            </span>
          ))}
        </motion.div>

        <div className="flex justify-center gap-4">
          <Link to="/sponsors">
            <Button variant="outline" size="lg" className="rounded-full font-body font-bold">
              View All Sponsors
            </Button>
          </Link>
          <Link to="/vendors">
            <Button variant="outline" size="lg" className="rounded-full font-body font-bold">
              View All Vendors
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SponsorsPreviewSection;
