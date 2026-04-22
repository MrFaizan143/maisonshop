import { Link } from "@tanstack/react-router";
import { Instagram, Facebook } from "lucide-react";
import { MomoIcon } from "@/components/brand-mark";

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2.5">
              <MomoIcon className="h-5 w-5" />
              <span className="font-display text-base">Asansol Momos</span>
            </div>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Hand-folded, freshly steamed. A small stall on Burnpur Road, serving since 2023.
            </p>
          </div>

          <div className="lg:col-span-3">
            <p className="eyebrow mb-5">Visit</p>
            <ul className="space-y-2 text-sm text-foreground">
              <li>Burnpur Road, Asansol</li>
              <li>West Bengal 713304</li>
              <li className="pt-2 text-muted-foreground">11am – 11pm, daily</li>
              <li><a href="tel:+919876543210" className="hover:text-accent">+91 98765 43210</a></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className="eyebrow mb-5">Explore</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/menu" className="hover:text-accent">Menu</Link></li>
              <li><Link to="/about" className="hover:text-accent">About</Link></li>
              <li><Link to="/gallery" className="hover:text-accent">Gallery</Link></li>
              <li><Link to="/catering" className="hover:text-accent">Catering</Link></li>
              <li><Link to="/contact" className="hover:text-accent">Contact</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className="eyebrow mb-5">Follow</p>
            <div className="flex gap-4">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-foreground">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="text-muted-foreground hover:text-foreground">
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Asansol Momos</p>
          <p>Handmade · Steamed daily</p>
        </div>
      </div>
    </footer>
  );
}
