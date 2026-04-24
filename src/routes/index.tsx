import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import catFashion from "@/assets/cat-fashion.jpg";
import catGrocery from "@/assets/cat-grocery.jpg";
import catElectronics from "@/assets/cat-electronics.jpg";
import catHome from "@/assets/cat-home.jpg";
import catBeauty from "@/assets/cat-beauty.jpg";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Maison — A Modern Department Store" },
      { name: "description", content: "Editorial fashion. Lush food. Sharp electronics. One destination — Maison. Cash on Delivery across India." },
    ],
  }),
});

function HomePage() {
  const [latest, setLatest] = useState<ProductCardData[]>([]);

  useEffect(() => {
    supabase
      .from("products")
      .select("id, title, slug, price, compare_at_price, image_url, rating, rating_count")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(8)
      .then(({ data }) => setLatest((data ?? []) as ProductCardData[]));
  }, []);

  return (
    <div className="bg-background">
      {/* ===== EDITORIAL SPLIT HERO ===== */}
      <section className="grid lg:grid-cols-2 min-h-[88vh] border-b border-border">
        {/* LEFT — FASHION (editorial monochrome) */}
        <SplitPanel
          to="/category/fashion"
          theme="fashion"
          eyebrow="Vol. 01 — Fashion"
          title={<><span className="block">The</span><em className="block not-italic">Editorial</em><span className="block">Issue.</span></>}
          subtitle="Asymmetric silhouettes, considered tailoring, and pieces that read like a manifesto."
          cta="Enter the lookbook"
          image={catFashion}
          align="left"
        />

        {/* RIGHT — FOOD (organic earthy) */}
        <SplitPanel
          to="/category/grocery"
          theme="grocery"
          eyebrow="Vol. 02 — Food"
          title={<><span className="block">Grown,</span><em className="block">harvested,</em><span className="block">delivered.</span></>}
          subtitle="Seasonal produce, slow ingredients, and pantry essentials with a sense of place."
          cta="Open the pantry"
          image={catGrocery}
          align="right"
        />
      </section>

      {/* ===== THE OTHER THREE — bento strip ===== */}
      <section className="mx-auto max-w-[1400px] px-5 sm:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Also in store</p>
            <h2 className="mt-3 editorial-headline text-5xl sm:text-6xl">Three more worlds.</h2>
          </div>
          <Link to="/search" search={{ q: "" }} className="hidden sm:inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] hover:underline">
            Browse all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <BentoTile to="/category/electronics" title="Electronics" tagline="Sharp. Considered. Connected." image={catElectronics} accentClass="bg-[oklch(0.65_0.2_250)] text-white" />
          <BentoTile to="/category/home" title="Home" tagline="Objects for a slower life." image={catHome} accentClass="bg-[oklch(0.7_0.1_55)] text-[oklch(0.15_0.02_40)]" />
          <BentoTile to="/category/beauty" title="Beauty" tagline="Quiet rituals, lasting glow." image={catBeauty} accentClass="bg-[oklch(0.78_0.09_15)] text-[oklch(0.18_0.02_350)]" />
        </div>
      </section>

      {/* ===== LATEST DROP ===== */}
      {latest.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-5 sm:px-8 pb-24">
          <div className="flex items-end justify-between mb-10 border-t border-border pt-12">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">The Drop</p>
              <h2 className="mt-3 editorial-headline text-5xl sm:text-6xl">Just arrived.</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {latest.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ===== MANIFESTO STRIP ===== */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1400px] grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
          {[
            { k: "01", t: "Cash on Delivery", s: "Pay when it arrives. No card needed." },
            { k: "02", t: "Free shipping ₹499+", s: "Anywhere in India, no fine print." },
            { k: "03", t: "Seven-day returns", s: "Change of heart? We understand." },
          ].map((m) => (
            <div key={m.k} className="px-8 py-12">
              <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">— {m.k}</div>
              <div className="mt-4 editorial-headline text-3xl">{m.t}</div>
              <p className="mt-3 text-sm text-muted-foreground">{m.s}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ============ SPLIT PANEL ============ */

function SplitPanel({
  to,
  theme,
  eyebrow,
  title,
  subtitle,
  cta,
  image,
  align,
}: {
  to: "/category/fashion" | "/category/grocery";
  theme: "fashion" | "grocery";
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  cta: string;
  image: string;
  align: "left" | "right";
}) {
  return (
    <Link
      to={to}
      data-theme={theme}
      className="group relative overflow-hidden bg-background text-foreground"
    >
      {/* Background image */}
      <motion.img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-70 transition-opacity duration-700 group-hover:opacity-90"
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      {/* Tint */}
      <div
        className={`absolute inset-0 ${
          theme === "fashion"
            ? "bg-[oklch(0.08_0_0)]/55"
            : "bg-[oklch(0.22_0.04_60)]/55"
        }`}
      />

      <div className={`relative flex h-full min-h-[88vh] flex-col justify-between p-8 sm:p-14 ${align === "right" ? "md:items-end md:text-right" : ""}`}>
        <div className="flex items-center justify-between w-full">
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/80">
            {eyebrow}
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/60">
            {theme === "fashion" ? "Editorial" : "Organic"}
          </span>
        </div>

        <div className={`max-w-xl ${align === "right" ? "md:ml-auto" : ""}`}>
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className={`text-white ${
              theme === "fashion"
                ? "editorial-headline text-[clamp(3.5rem,9vw,8rem)]"
                : "organic-headline text-[clamp(3rem,8vw,7rem)]"
            }`}
          >
            {title}
          </motion.h1>
          <p className="mt-6 max-w-md text-white/85 text-base sm:text-lg leading-relaxed">
            {subtitle}
          </p>
          <div className={`mt-8 inline-flex items-center gap-3 ${align === "right" ? "md:flex-row-reverse" : ""}`}>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-black transition-transform group-hover:translate-x-1">
              <ArrowUpRight className="h-5 w-5" />
            </span>
            <span className="font-mono text-[12px] uppercase tracking-[0.25em] text-white">{cta}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ============ BENTO TILE ============ */

function BentoTile({
  to,
  title,
  tagline,
  image,
  accentClass,
}: {
  to: "/category/electronics" | "/category/home" | "/category/beauty";
  title: string;
  tagline: string;
  image: string;
  accentClass: string;
}) {
  return (
    <Link to={to} className="group relative aspect-[4/5] md:aspect-[3/4] overflow-hidden rounded-2xl bg-muted">
      <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute inset-0 p-6 flex flex-col justify-between">
        <span className={`self-start rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] ${accentClass}`}>
          {title}
        </span>
        <div>
          <h3 className="font-display text-3xl text-white leading-tight">{tagline}</h3>
          <div className="mt-3 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/80">
            Discover <ArrowUpRight className="h-3 w-3" />
          </div>
        </div>
      </div>
    </Link>
  );
}
