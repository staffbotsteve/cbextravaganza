import { motion } from "framer-motion";
import { Music, Wine, Star } from "lucide-react";

const stages = [
  {
    icon: Music,
    stage: "Main Stage",
    artist: "Big Crush",
    description: "High-energy rock and dance hits to keep the party going all night long.",
    color: "bg-primary",
  },
  {
    icon: Wine,
    stage: "Wine Courtyard",
    artist: "Don Rodriguez Group",
    description: "Smooth jazz and soulful grooves perfect for the wine tasting experience.",
    color: "bg-secondary",
  },
  {
    icon: Star,
    stage: "Private Reserve",
    artist: "Kyle Tuttle '05",
    description: "CB alum and Nashville banjo virtuoso brings Americana flair to an intimate VIP setting.",
    color: "bg-accent",
  },
];

const EntertainmentSection = () => {
  return (
    <section className="py-20 bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="font-display font-black text-4xl md:text-5xl mb-3">
            Live Entertainment
          </h2>
          <p className="font-body text-secondary-foreground/70 text-lg">
            Three stages. Three incredible acts. One unforgettable night.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {stages.map((stage, i) => (
            <motion.div
              key={stage.stage}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative group"
            >
              <div className="bg-secondary-foreground/10 backdrop-blur-sm rounded-2xl p-8 border border-secondary-foreground/10 hover:border-primary/50 transition-all">
                <div className={`w-14 h-14 ${stage.color} rounded-xl flex items-center justify-center mb-5`}>
                  <stage.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <p className="font-body text-secondary-foreground/60 uppercase text-xs tracking-widest font-bold mb-1">
                  {stage.stage}
                </p>
                <h3 className="font-display font-black text-2xl mb-3">{stage.artist}</h3>
                <p className="font-body text-secondary-foreground/70 text-sm leading-relaxed">
                  {stage.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EntertainmentSection;
