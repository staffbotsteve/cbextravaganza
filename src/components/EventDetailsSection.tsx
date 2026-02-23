import { motion } from "framer-motion";
import { MapPin, Clock, Shirt, Heart } from "lucide-react";

const details = [
  {
    icon: Heart,
    title: "Our Mission",
    description: "All proceeds support the CBHS Tuition Assistance Fund, helping families access a Christian Brothers education for 150 years.",
  },
  {
    icon: MapPin,
    title: "Location",
    description: "Christian Brothers High School Campus, Memphis, TN. Outdoor festival grounds with multiple stages and vendor areas.",
  },
  {
    icon: Clock,
    title: "Schedule",
    description: "Gates open at 6:00 PM. Live entertainment from 6:30 PM–11:00 PM. Food and beverage vendors throughout the evening.",
  },
  {
    icon: Shirt,
    title: "Dress Code",
    description: "Casual and festive! Wear comfortable shoes for the outdoor grounds. CB spirit wear encouraged.",
  },
];

const EventDetailsSection = () => {
  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="font-display font-black text-foreground text-4xl md:text-5xl mb-3">
            Event Details
          </h2>
          <p className="font-body text-muted-foreground text-lg max-w-xl mx-auto">
            Celebrating 150 years of Christian Brothers tradition
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {details.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display font-bold text-foreground text-xl mb-2">{item.title}</h3>
              <p className="font-body text-muted-foreground text-sm leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventDetailsSection;
