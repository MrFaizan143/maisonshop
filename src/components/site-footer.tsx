import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Phone, MapPin, Clock } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-4">
          <div>
            <BrandMark />
            <p className="mt-4 text-sm leading-relaxed text-primary-foreground/75">
              Hand-folded, freshly steamed momos served with love from our little corner of Asansol.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-display text-lg text-accent">Visit</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>Burnpur Road, Asansol,<br />West Bengal 713304</span>
              </li>
              <li className="flex gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>Open daily 11am – 11pm</span>
              </li>
              <li className="flex gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <a href="tel:+919876543210" className="hover:text-accent">+91 98765 43210</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display text-lg text-accent">Explore</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link to="/menu" className="hover:text-accent">Menu</Link></li>
              <li><Link to="/about" className="hover:text-accent">Our Story</Link></li>
              <li><Link to="/gallery" className="hover:text-accent">Gallery</Link></li>
              <li><Link to="/catering" className="hover:text-accent">Catering & Bulk Orders</Link></li>
              <li><Link to="/contact" className="hover:text-accent">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display text-lg text-accent">Follow</h4>
            <div className="flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-accent/40 transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-accent/40 transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
            <p className="mt-6 text-xs text-primary-foreground/60">
              Established 2023 · Made with love in Asansol
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-primary-foreground/10 pt-6 text-xs text-primary-foreground/60 sm:flex-row">
          <p>© {new Date().getFullYear()} Asansol Momos. All rights reserved.</p>
          <p>Steamed daily · Handmade · Authentic</p>
        </div>
      </div>
    </footer>
  );
}
