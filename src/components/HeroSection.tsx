import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";
import CountdownTimer from "./CountdownTimer";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="CB Extravaganza event" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 pt-24 pb-16">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display italic text-primary-foreground/80 text-xl md:text-2xl mb-2"
          >
            36th Annual
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-display font-black text-primary-foreground text-5xl md:text-7xl lg:text-8xl leading-[0.9] mb-6"
          >
            CHRISTIAN
            <br />
            BROTHERS
            <br />
            <span className="tracking-wider">EXTRAVAGANZA</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="font-display font-bold text-accent text-2xl md:text-3xl mb-6"
          >
            Saturday, September 6, 2025
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="font-body text-primary-foreground/90 text-base md:text-lg max-w-lg mb-8 leading-relaxed"
          >
            Kick off our celebration of 150 years of Christian Brothers history with this
            special CB tradition! Wineries, breweries, restaurants, caterers, live music,
            and so much more will join us on campus in support of the CBHS Tuition
            Assistance Fund.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4 mb-12"
          >
            <Link to="/tickets">
              <Button
                size="lg"
                className="bg-background text-primary font-body font-bold text-lg px-10 py-6 rounded-full hover:bg-background/90 animate-pulse-glow"
              >
                TICKETS
              </Button>
            </Link>
            <Link to="/get-involved">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-primary-foreground text-primary-foreground font-body font-bold text-lg px-10 py-6 rounded-full hover:bg-primary-foreground/10"
              >
                GET INVOLVED
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <CountdownTimer targetDate="2025-09-06T18:00:00" />
          </motion.div>
        </div>

        {/* Presenting Sponsor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="mt-12 flex items-center gap-4"
        >
          <p className="font-display italic text-primary-foreground/70 text-sm">
            Presenting Sponsor
          </p>
          <span className="font-display font-black text-primary-foreground text-2xl tracking-widest">
            CAPTRUST
          </span>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
