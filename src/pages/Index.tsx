import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import EventDetailsSection from "@/components/EventDetailsSection";
import EntertainmentSection from "@/components/EntertainmentSection";
import SponsorsPreviewSection from "@/components/SponsorsPreviewSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <EventDetailsSection />
        <EntertainmentSection />
        <SponsorsPreviewSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
