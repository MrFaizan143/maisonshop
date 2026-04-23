import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Truck, ShieldCheck, RotateCcw, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import heroImg from "@/assets/hero-shop.jpg";
import catElectronics from "@/assets/cat-electronics.jpg";
import catFashion from "@/assets/cat-fashion.jpg";
import catHome from "@/assets/cat-home.jpg";
import catBeauty from "@/assets/cat-beauty.jpg";
import catGrocery from "@/assets/cat-grocery.jpg";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const CATEGORY_TILES = [
  { slug: "electronics", label: "Electronics", img: catElectronics },
  { slug: "fashion", label: "Fashion", img: catFashion },
  { slug: "home", label: "Home", img: catHome },
  { slug: "beauty", label: "Beauty", img: catBeauty },
  { slug: "grocery", label: "Grocery", img: catGrocery },
];

function HomePage() {
  const [featured, setFeatured] = useState<ProductCardData[]>([]);
  const [latest, setLatest] = useState<ProductCardData[]>([]);

  useEffect(() => {
    supabase
      .from("products")
      .select("id, title, slug, price, compare_at_price, image_url, rating, rating_count")
      .eq("active", true)
      .eq("featured", true)
      .limit(8)
      .then(({ data }) => setFeatured((data ?? []) as ProductCardData[]));

    supabase
      .from("products")
      .select("id, title, slug, price, compare_at_price, image_url, rating, rating_count")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(12)
      .then(({ data }) => setLatest((data ?? []) as ProductCardData[]));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-hero shadow-pop">
        <img src={heroImg} alt="Shopping deals" className="absolute inset-0 h-full w-full object-cover opacity-80" width={1600} height={640} />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-primary/40 to-transparent" />
        <div className="relative px-6 py-12 sm:px-12 sm:py-20 lg:py-28 max-w-2xl">
          <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent-foreground">Mega Sale Live</span>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-primary-foreground sm:text-5xl lg:text-6xl">Up to 70% off everything you need</h1>
          <p className="mt-4 max-w-md text-base text-primary-foreground/85 sm:text-lg">Electronics, fashion, home, beauty, and groceries — Cash on Delivery.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/category/$slug" params={{ slug: "electronics" }} className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:bg-accent/90">
              Shop Now <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/category/$slug" params={{ slug: "fashion" }} className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-primary-foreground backdrop-blur hover:bg-white/20">Browse Fashion</Link>
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: Truck, label: "Free shipping", sub: "Orders over ₹499" },
          { icon: Wallet, label: "Cash on Delivery", sub: "Pay on receipt" },
          { icon: RotateCcw, label: "7-day returns", sub: "Easy & free" },
          { icon: ShieldCheck, label: "100% secure", sub: "Verified sellers" },
        ].map((f) => (
          <div key={f.label} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 sm:p-4 shadow-card">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent"><f.icon className="h-5 w-5" /></div>
            <div className="min-w-0">
              <div className="text-sm font-semibold leading-tight">{f.label}</div>
              <div className="text-xs text-muted-foreground truncate">{f.sub}</div>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold sm:text-2xl">Shop by Category</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {CATEGORY_TILES.map((c) => (
            <Link key={c.slug} to="/category/$slug" params={{ slug: c.slug }} className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-3 shadow-card transition-all hover:shadow-pop hover:-translate-y-0.5">
              <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted">
                <img src={c.img} alt={c.label} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <span className="text-sm font-medium">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mt-10">
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-xl font-semibold sm:text-2xl">Featured Deals</h2>
            <span className="text-xs font-semibold text-deal uppercase tracking-wide">Limited Time</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold sm:text-2xl">New Arrivals</h2>
        {latest.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">No products yet. Add some via the admin panel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {latest.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
