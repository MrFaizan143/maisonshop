import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { X } from "lucide-react";
import hero from "@/assets/hero-stall.jpg";
import steamed from "@/assets/momo-steamed.jpg";
import fried from "@/assets/momo-fried.jpg";
import tandoori from "@/assets/momo-tandoori.jpg";
import soup from "@/assets/momo-soup.jpg";
import schezwan from "@/assets/momo-schezwan.jpg";
import cheese from "@/assets/momo-cheese.jpg";
import veg from "@/assets/momo-veg.jpg";
import combo from "@/assets/momo-combo.jpg";
import paneer from "@/assets/momo-paneer.jpg";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Asansol Momos" },
      { name: "description", content: "A look inside our stall, our momos, and our happy customers." },
      { property: "og:title", content: "Gallery — Asansol Momos" },
      { property: "og:description", content: "A look inside our stall, our momos, and our happy customers." },
      { property: "og:image", content: hero },
    ],
  }),
  component: GalleryPage,
});

const IMAGES = [
  { src: hero, alt: "Stall at golden hour" },
  { src: steamed, alt: "Steamed momos" },
  { src: tandoori, alt: "Tandoori momos" },
  { src: fried, alt: "Fried momos" },
  { src: combo, alt: "Family combo platter" },
  { src: schezwan, alt: "Schezwan momos" },
  { src: soup, alt: "Momo soup" },
  { src: cheese, alt: "Cheese momos" },
  { src: veg, alt: "Veg momos" },
  { src: paneer, alt: "Paneer momos" },
];

function GalleryPage() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-12 pb-24 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-accent">Gallery</p>
        <h1 className="font-display text-5xl font-bold text-primary sm:text-6xl">Look at all those pleats</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {IMAGES.map((img, i) => (
          <button
            key={i}
            onClick={() => setOpen(img.src)}
            className={`group relative overflow-hidden rounded-2xl shadow-soft transition-transform hover:scale-[1.02] ${i === 0 ? "col-span-2 row-span-2 aspect-square sm:col-span-2" : "aspect-square"}`}
          >
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-primary/0 transition-colors group-hover:bg-primary/20" />
          </button>
        ))}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-primary/90 p-4 backdrop-blur"
          onClick={() => setOpen(null)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-background/90 p-2 text-primary"
            onClick={() => setOpen(null)}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <img src={open} alt="" className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain" />
        </div>
      )}
    </div>
  );
}
