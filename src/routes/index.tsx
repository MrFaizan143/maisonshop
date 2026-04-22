import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChefHat, Flame, Leaf, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { storefrontApiRequest, STOREFRONT_QUERY, type ShopifyProduct } from "@/lib/shopify";
import heroImg from "@/assets/hero-stall.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Asansol Momos — The Authentic Dumpling Experience" },
      { name: "description", content: "Hand-folded, freshly steamed momos from Asansol's beloved stall. Order online for pickup or delivery." },
      { property: "og:title", content: "Asansol Momos — The Authentic Dumpling Experience" },
      { property: "og:description", content: "Hand-folded, freshly steamed momos. Order online for pickup or delivery." },
      { property: "og:image", content: heroImg },
      { name: "twitter:image", content: heroImg },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [featured, setFeatured] = useState<ShopifyProduct[]>([]);

  useEffect(() => {
    storefrontApiRequest(STOREFRONT_QUERY, { first: 4, query: null })
      .then((data) => setFeatured(data?.data?.products?.edges ?? []))
      .catch(() => {});
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={heroImg} alt="Asansol Momos stall at golden hour" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/40 to-primary/85" />
        </div>

        <div className="mx-auto flex min-h-[88vh] max-w-7xl flex-col items-start justify-end px-4 pb-16 pt-32 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl text-cream"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-background/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-accent backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Est. 2023 · Asansol
            </div>
            <h1 className="font-display text-5xl font-bold leading-[1.05] text-cream text-balance sm:text-6xl lg:text-7xl">
              The Authentic <span className="italic text-accent">Dumpling</span> Experience
            </h1>
            <p className="mt-6 max-w-xl text-lg text-cream/85 text-balance">
              Hand-folded each morning. Steamed in bamboo. Served with our family-recipe red chutney that everyone keeps asking about.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/menu">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Order Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/menu">
                <Button size="lg" variant="outline" className="border-cream/30 bg-background/10 text-cream backdrop-blur hover:bg-background/20 hover:text-cream">
                  View Full Menu
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* VALUE STRIP */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            { icon: ChefHat, title: "Handmade Daily", text: "Each momo folded by hand at dawn" },
            { icon: Leaf, title: "Steamed Fresh", text: "Bamboo-steamed to order, never sitting" },
            { icon: Flame, title: "Family Recipe", text: "Our chutneys, kept the same since day one" },
          ].map((v) => (
            <div key={v.title} className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                <v.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-primary">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED MENU */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-accent">Tasting Selection</p>
            <h2 className="font-display text-4xl font-bold text-primary sm:text-5xl">Freshly Steamed Favourites</h2>
          </div>
          <Link to="/menu" className="hidden shrink-0 sm:block">
            <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground">
              See full menu <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center">
            <p className="text-muted-foreground">Loading our menu…</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => <ProductCard key={p.node.id} product={p} />)}
          </div>
        )}
      </section>

      {/* STORY TEASER */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-accent">Our Story</p>
            <h2 className="font-display text-4xl font-bold text-balance sm:text-5xl">
              A little stall with a big heart for momos.
            </h2>
            <p className="mt-6 text-primary-foreground/80 text-balance">
              What began as a small wooden cart on Burnpur Road in 2023 has become a daily ritual for Asansol's hungriest souls. We still hand-fold every momo. We still use the same recipe. We just have a few more bamboo steamers now.
            </p>
            <Link to="/about" className="mt-8 inline-block">
              <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                Read our story <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-accent/10 blur-2xl" />
            <img
              src={heroImg}
              alt="Asansol Momos stall"
              loading="lazy"
              width={800}
              height={600}
              className="relative aspect-[4/3] w-full rounded-3xl object-cover shadow-warm"
            />
          </div>
        </div>
      </section>

      {/* CATERING CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-accent/30 bg-gradient-warm p-10 text-center sm:p-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-accent">Bulk Orders</p>
          <h2 className="font-display text-4xl font-bold text-primary text-balance sm:text-5xl">
            Feeding a crowd? We've got you.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Office lunches, house parties, weddings, festivals — we'll steam hundreds of momos and bring them piping hot.
          </p>
          <Link to="/catering" className="mt-8 inline-block">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Request a Catering Quote
            </Button>
          </Link>
        </div>
      </section>

      {/* TESTIMONIALS (placeholder structure, no fake content) */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-accent">Customer Love</p>
          <h2 className="font-display text-4xl font-bold text-primary sm:text-5xl">What folks are saying</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
              <div className="mb-3 flex justify-center gap-0.5 text-accent/30">
                {[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4" />)}
              </div>
              <p className="text-sm text-muted-foreground">No reviews yet — be among the first to share yours.</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
