import { restaurant } from "@/config/restaurant";
import { Link } from "wouter";
import { Facebook, Instagram, MapPin, Phone, Clock } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground text-background pt-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-display font-bold text-primary">
              {restaurant.name}
            </h3>
            <p className="text-muted-foreground/80 leading-relaxed max-w-sm">
              {restaurant.description}
            </p>
            <div className="flex space-x-4 pt-2">
              <a
                href="#"
                className="p-2 bg-white/10 rounded-full hover:bg-primary hover:text-white transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-white/10 rounded-full hover:bg-primary hover:text-white transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-primary">Explore</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground/80 hover:text-primary transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/menu"
                  className="text-muted-foreground/80 hover:text-primary transition-colors"
                >
                  Our Menu
                </Link>
              </li>
              <li>
                <Link
                  href="/reservations"
                  className="text-muted-foreground/80 hover:text-primary transition-colors"
                >
                  Book a Table
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground/80 hover:text-primary transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-primary">Visit Us</h4>
            <div className="space-y-3 text-muted-foreground/80">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-1" />
                <span>{restaurant.address}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span>{restaurant.phone}</span>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-primary shrink-0 mt-1" />
                <div>
                  <p>Mon-Fri: {restaurant.hours.weekdays}</p>
                  <p>Sat-Sun: {restaurant.hours.weekends}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 text-center text-sm text-muted-foreground/60">
          <p>
            © {new Date().getFullYear()} {restaurant.name}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
