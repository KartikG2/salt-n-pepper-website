import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { restaurant } from "@/config/restaurant";
import { MapPin, Phone, Clock, Navigation, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-secondary/10 py-16 text-center">
        <h1 className="text-4xl font-display font-bold mb-4">Contact Us</h1>
        <p className="text-muted-foreground max-w-xl mx-auto px-4">
          Visit us at our Gadag-Betageri location for authentic vegetarian
          flavors.
        </p>
      </div>

      <div className="flex-1 container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Info Cards */}
          <div className="space-y-6">
            {/* Address Card */}
            <div className="flex items-start gap-4 p-6 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">Our Location</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {restaurant.address}
                </p>
                <Button
                  asChild
                  size="sm"
                  className="gap-2 shadow-sm"
                  data-testid="button-get-directions"
                >
                  <a
                    href={restaurant.directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Navigation className="w-4 h-4" />
                    Get Directions
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Phone Card */}
            <div className="flex items-start gap-4 p-6 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <Phone className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">Phone Number</h3>
                <a
                  href={`tel:${restaurant.phone.replace(/\s/g, "")}`}
                  className="text-primary font-mono text-xl font-semibold hover:underline transition-all"
                  data-testid="link-phone"
                >
                  {restaurant.phone}
                </a>
                <p className="text-sm text-muted-foreground mt-1 italic">
                  Available during working hours
                </p>
              </div>
            </div>

            {/* Hours Card */}
            <div className="flex items-start gap-4 p-6 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Opening Hours</h3>
                <div className="text-muted-foreground space-y-2 font-medium">
                  <p className="flex justify-between gap-12 border-b border-border/50 pb-1">
                    <span>Mon - Fri:</span>
                    <span className="text-foreground">
                      {restaurant.hours.weekdays}
                    </span>
                  </p>
                  <p className="flex justify-between gap-12">
                    <span>Sat - Sun:</span>
                    <span className="text-foreground">
                      {restaurant.hours.weekends}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Map */}
          <div className="space-y-4">
            <div className="h-[450px] rounded-2xl overflow-hidden shadow-xl border-2 border-primary/5 bg-muted relative group">
              <iframe
                src={restaurant.locationUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full grayscale-[0.2] contrast-[1.1] group-hover:grayscale-0 transition-all duration-500"
                title="Salt N Papper Restaurant Location"
              ></iframe>
            </div>
            <div className="flex justify-center">
              <Button
                asChild
                variant="outline"
                className="gap-2 border-primary/20 hover:bg-primary/5"
                data-testid="button-open-maps"
              >
                <a
                  href={restaurant.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin className="w-4 h-4 text-primary" />
                  View on Large Map
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
