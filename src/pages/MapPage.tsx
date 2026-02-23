import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const MapPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h1 className="font-display font-black text-foreground text-4xl md:text-5xl mb-3">Event Map</h1>
            <p className="font-body text-muted-foreground text-lg max-w-xl mx-auto">
              Find your way around the CB Extravaganza grounds.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-muted rounded-2xl p-12 text-center border border-border">
            <p className="font-body text-muted-foreground text-lg">
              Event map coming soon! Check back as we get closer to September 12, 2026.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MapPage;
