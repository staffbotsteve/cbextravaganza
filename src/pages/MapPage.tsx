import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const MapPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Title */}
          <div className="text-center mb-10">
            <h1 className="font-display font-black text-foreground text-4xl md:text-5xl mb-3">
              EVENT MAP
            </h1>
          </div>

          {/* Embedded Campus Map */}
          <div className="max-w-5xl mx-auto mb-16">
            <div className="relative w-full overflow-hidden rounded-2xl border border-border" style={{ paddingBottom: "65%" }}>
              <iframe
                src="https://cdn.maps.moderncampus.net/nucloudmap/index.html?map=875"
                title="CB Extravaganza Event Map"
                className="absolute inset-0 w-full h-full"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>

          {/* Arrival & Departure Info */}
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Arrival */}
            <section>
              <h2 className="font-display font-bold text-foreground text-2xl md:text-3xl mb-6">
                Arrival
              </h2>

              <div className="space-y-4 font-body text-muted-foreground leading-relaxed">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-muted rounded-xl p-6 border border-border">
                    <h3 className="font-semibold text-foreground mb-2">General Admission</h3>
                    <p>Doors Open at 7:00pm</p>
                  </div>
                  <div className="bg-muted rounded-xl p-6 border border-border">
                    <h3 className="font-semibold text-foreground mb-2">Private Reserve</h3>
                    <p>Doors Open at 5:30pm</p>
                  </div>
                </div>

                <div className="bg-muted rounded-xl p-6 border border-border space-y-3">
                  <p>
                    <span className="font-semibold text-foreground">By car</span> –{" "}
                    <a
                      href="https://cdn.maps.moderncampus.net/nucloudmap/index.html?map=875&marker=17411"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline hover:text-primary/80"
                    >
                      south student parking lot
                    </a>{" "}
                    with pre-purchased parking pass. All other campus parking is restricted.
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Shuttle</span> – the CBE Shuttle will drop guests off at the entrance.
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Rideshare, taxi, drop-off</span> – guests should be dropped off at the{" "}
                    <a
                      href="https://cdn.maps.moderncampus.net/nucloudmap/index.html?map=875&marker=17413"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline hover:text-primary/80"
                    >
                      pedestrian gate
                    </a>{" "}
                    at the south corner of Br. Bertram Hall and must walk to the entrance gates. NO drop-off cars are permitted beyond the parking lot gates.
                  </p>
                  <p className="text-sm italic">
                    Please note that all other gates on campus (including the Front Office, faculty parking lot, etc.) will be closed to entry.
                  </p>
                </div>
              </div>
            </section>

            {/* Departure */}
            <section>
              <h2 className="font-display font-bold text-foreground text-2xl md:text-3xl mb-6">
                Departure
              </h2>

              <div className="bg-muted rounded-xl p-6 border border-border space-y-3 font-body text-muted-foreground leading-relaxed">
                <p>The CB Extravaganza ends at 10:00pm.</p>
                <p>
                  <span className="font-semibold text-foreground">Shuttle</span> – please proceed to the{" "}
                  <a
                    href="https://cdn.maps.moderncampus.net/nucloudmap/index.html?map=875&marker=17422"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline hover:text-primary/80"
                  >
                    CBE Shuttle pick-up area
                  </a>{" "}
                  at the Cafeteria/Nunan Family Grove gate.
                </p>
                <p>
                  <span className="font-semibold text-foreground">Rideshare, taxi, drop-off</span> – guests should leave through the Front Office gate (gate opens at 9:30pm) and find their drivers in the{" "}
                  <a
                    href="https://cdn.maps.moderncampus.net/nucloudmap/index.html?map=875&marker=17423"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline hover:text-primary/80"
                  >
                    pick-up zone
                  </a>{" "}
                  by the flagpole.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MapPage;
