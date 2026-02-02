import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { restaurant } from "@/config/restaurant";
import { Link } from "wouter";
import { ArrowRight, Star, Clock, MapPin, Truck } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          {/* North Indian Thali Spread */}
          <img
            src="https://images.unsplash.com/photo-1514326640560-7d063ef2aed5?q=80&w=2000&auto=format&fit=crop"
            alt="Delicious Indian Food Spread"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
        </div>

        <div className="container-custom relative z-10 text-center text-white space-y-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full border border-white/30 bg-white/10 backdrop-blur-md text-sm font-medium mb-4">
              Since 2010 • Pure Vegetarian
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6">
              Taste the Authentic <br />
              <span className="text-primary">Flavors of India</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed">
              Experience culinary excellence with our handcrafted dishes, made
              from traditional recipes passed down through generations.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/menu">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-14 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 text-white border-0 shadow-lg shadow-primary/30"
                >
                  Order Now
                </Button>
              </Link>
              <Link href="/reservations">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto h-14 px-8 text-lg rounded-full bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm"
                >
                  Book a Table
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {restaurant.features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 rounded-2xl bg-white border border-border/50 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
                  {feature.icon === "Leaf" && <Star className="w-8 h-8" />}
                  {feature.icon === "Users" && <MapPin className="w-8 h-8" />}
                  {feature.icon === "Bike" && <Truck className="w-8 h-8" />}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Items Preview */}
      <section className="py-20 bg-secondary/5">
        <div className="container-custom">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-primary font-bold tracking-wider uppercase text-sm">
                Our Specialties
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold mt-2">
                Popular Dishes
              </h2>
            </div>
            <Link
              href="/menu"
              className="hidden md:flex items-center text-primary font-semibold hover:translate-x-1 transition-transform"
            >
              View Full Menu <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Hardcoded preview cards for visuals */}
            {[
              {
                name: "Paneer Butter Masala",
                desc: "Rich tomato gravy with cottage cheese cubes and butter.",
                price: 240,
                img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80",
              },
              {
                name: "Vegetable Biryani",
                desc: "Aromatic basmati rice cooked with fresh vegetables and spices.",
                price: 210,
                img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80",
              },
              {
                name: "Dal Makhani",
                desc: "Creamy black lentils simmered overnight with kidney beans.",
                price: 190,
                img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="h-64 overflow-hidden relative">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full font-bold text-sm shadow-sm">
                    ₹{item.price}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                  <p className="text-muted-foreground mb-4">{item.desc}</p>
                  <Link href="/menu">
                    <Button
                      variant="ghost"
                      className="p-0 h-auto text-primary hover:text-primary/80 hover:bg-transparent font-semibold"
                    >
                      Order Now
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center md:hidden">
            <Link href="/menu">
              <Button size="lg" variant="outline" className="w-full">
                View Full Menu
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Info Banner */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div>
              <h2 className="text-3xl font-display font-bold mb-4">
                Visit Us Today!
              </h2>
              <div className="flex flex-col md:flex-row gap-6 text-primary-foreground/90">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Clock className="w-5 h-5" />
                  <span>Open Daily: 11:00 AM - 10:30 PM</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>Gadag-Betageri, Karnataka</span>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <a href={`tel:${restaurant.phone}`}>
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90"
                >
                  Call Now
                </Button>
              </a>
              <a
                href={restaurant.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Get Directions
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
