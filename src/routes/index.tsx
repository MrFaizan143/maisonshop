import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Flame, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { getRecentlyViewed } from "@/lib/recently-viewed";
import { trackEvent } from "@/lib/analytics";
import { isValidEmail } from "@/lib/validation";
import { PRODUCT_SELECT } from "@/lib/constants";
import { toast } from "sonner";
import catFashion from "@/assets/cat-fashion.jpg";
import catGrocery from "@/assets/cat-grocery.jpg";
import catElectronics from "@/assets/cat-electronics.jpg";
import catHome from "@/assets/cat-home.jpg";
import catBeauty from "@/assets/cat-beauty.jpg";

const MAX_NEWSLETTER_SIGNUPS = 500;

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Maison — A Modern Department Store" },
      {
        name: "description",
        content:
          "Editorial fashion. Lush food. Sharp electronics. One destination — Maison. Cash on Delivery across India.",
      },
    ],
  }),
});

function HomePage() {
  const [latest, setLatest] = useState<ProductCardData[]>([]);
  const [trending, setTrending] = useState<ProductCardData[]>([]);
  const [bestSellers, setBestSellers] = useState<ProductCardData[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<ProductCardData[]>([]);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterDone, setNewsletterDone] = useState(() => {
    try {
      return localStorage.getItem("maison-newsletter-done") === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    let mounted = true;
    const viewed = getRecentlyViewed().map(({ viewedAt, ...rest }) => rest);
    setRecentlyViewed(viewed as ProductCardData[]);

    const loadHomepageCollections = async () => {
      try {
        const [latestRes, bestSellersRes, trendingRes] = await Promise.all([
          supabase
            .from("products")
            .select(PRODUCT_SELECT)
            .eq("active", true)
            .order("created_at", { ascending: false })
            .limit(8),
          supabase
            .from("products")
            .select(PRODUCT_SELECT)
            .eq("active", true)
            .gt("stock", 0)
            .order("rating", { ascending: false, nullsFirst: false })
            .order("rating_count", { ascending: false })
            .limit(4),
          supabase
            .from("products")
            .select(PRODUCT_SELECT)
            .eq("active", true)
            .gt("stock", 0)
            .order("updated_at", { ascending: false })
            .limit(4),
        ]);

        if (!mounted) {
          return;
        }

        if (latestRes.error || bestSellersRes.error || trendingRes.error) {
          toast.error("Could not load all homepage products. Showing available items.");
        }

        setLatest((latestRes.data ?? []) as ProductCardData[]);
        setBestSellers((bestSellersRes.data ?? []) as ProductCardData[]);
        setTrending((trendingRes.data ?? []) as ProductCardData[]);
      } finally {
        if (mounted) {
          setLoadingLatest(false);
        }
      }
    };

    void loadHomepageCollections();

    return () => {
      mounted = false;
    };
  }, []);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    const email = newsletterEmail.trim().toLowerCase();
    if (!email || !isValidEmail(email)) {
      toast.error("Enter a valid email address");
      return;
    }
    try {
      const key = "maison-newsletter-signups";
      const prev = JSON.parse(localStorage.getItem(key) ?? "[]") as string[];
      const next = [email, ...prev.filter((v) => v !== email)].slice(0, MAX_NEWSLETTER_SIGNUPS);
      localStorage.setItem(key, JSON.stringify(next));
      localStorage.setItem("maison-newsletter-done", "1");
      setNewsletterDone(true);
      setNewsletterEmail("");
      trackEvent("newsletter_subscribe", { emailDomain: email.split("@")[1] ?? "unknown" });
    } catch {
      // ignore storage errors
    }
  };

  return (
    <div className="bg-background">
      <h1 className="sr-only">Maison modern department store</h1>
      {/* ===== EDITORIAL SPLIT HERO ===== */}
      <section className="grid lg:grid-cols-2 min-h-[88vh] border-b border-border">
        {/* LEFT — FASHION (editorial monochrome) */}
        <SplitPanel
          slug="fashion"
          theme="fashion"
          eyebrow="Vol. 01 — Fashion"
          title={
            <>
              <span className="block">The</span>
              <em className="block not-italic">Editorial</em>
              <span className="block">Issue.</span>
            </>
          }
          subtitle="Asymmetric silhouettes, considered tailoring, and pieces that read like a manifesto."
          cta="Shop fashion now"
          image={catFashion}
          align="left"
          imagePriority
        />

        {/* RIGHT — FOOD (organic earthy) */}
        <SplitPanel
          slug="grocery"
          theme="grocery"
          eyebrow="Vol. 02 — Food"
          title={
            <>
              <span className="block">Grown,</span>
              <em className="block">harvested,</em>
              <span className="block">delivered.</span>
            </>
          }
          subtitle="Seasonal produce, slow ingredients, and pantry essentials with a sense of place."
          cta="Shop groceries now"
          image={catGrocery}
          align="right"
          imagePriority
        />
      </section>

      {(bestSellers.length > 0 || trending.length > 0) && (
        <section className="mx-auto max-w-[1400px] px-5 sm:px-8 py-14">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="editorial-headline text-4xl">Best sellers</h2>
                <Star className="h-4 w-4" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {bestSellers.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
            <div>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="editorial-headline text-4xl">Trending now</h2>
                <Flame className="h-4 w-4" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {trending.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== THE OTHER THREE — bento strip ===== */}
      <section className="mx-auto max-w-[1400px] px-5 sm:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              Also in store
            </p>
            <h2 className="mt-3 editorial-headline text-5xl sm:text-6xl">Three more worlds.</h2>
          </div>
          <Link
            to="/search"
            search={{ q: "" }}
            className="hidden sm:inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] hover:underline"
          >
            Browse all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <Link
          to="/search"
          search={{ q: "" }}
          className="mb-6 inline-flex sm:hidden items-center gap-2 rounded-full border border-border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] hover:bg-muted"
        >
          Browse all <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <BentoTile
            slug="electronics"
            title="Electronics"
            tagline="Sharp. Considered. Connected."
            image={catElectronics}
            accentClass="bg-[oklch(0.65_0.2_250)] text-white"
          />
          <BentoTile
            slug="home"
            title="Home"
            tagline="Objects for a slower life."
            image={catHome}
            accentClass="bg-[oklch(0.7_0.1_55)] text-[oklch(0.15_0.02_40)]"
          />
          <BentoTile
            slug="beauty"
            title="Beauty"
            tagline="Quiet rituals, lasting glow."
            image={catBeauty}
            accentClass="bg-[oklch(0.78_0.09_15)] text-[oklch(0.18_0.02_350)]"
          />
        </div>
      </section>

      {/* ===== LATEST DROP ===== */}
      {(loadingLatest || latest.length > 0) && (
        <section className="mx-auto max-w-[1400px] px-5 sm:px-8 pb-24">
          <div className="flex items-end justify-between mb-10 border-t border-border pt-12">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                The Drop
              </p>
              <h2 className="mt-3 editorial-headline text-5xl sm:text-6xl">Just arrived.</h2>
            </div>
          </div>
          {loadingLatest ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/5] bg-muted" />
                  <div className="mt-3 h-4 w-2/3 bg-muted" />
                  <div className="mt-2 h-3 w-1/3 bg-muted" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {latest.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      )}

      {recentlyViewed.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-5 sm:px-8 pb-24">
          <div className="flex items-end justify-between mb-10 border-t border-border pt-12">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                Continue browsing
              </p>
              <h2 className="mt-3 editorial-headline text-5xl sm:text-6xl">Recently viewed.</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {recentlyViewed.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ===== NEWSLETTER STRIP ===== */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1400px] grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
          <div className="px-8 py-14">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              — Stay in the loop
            </p>
            <h2 className="mt-4 editorial-headline text-4xl sm:text-5xl">The Maison Letter.</h2>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground leading-relaxed">
              New arrivals, editorial picks, and quiet exclusives — delivered when it matters.
            </p>
          </div>
          <div className="px-8 py-14 flex items-center">
            <form
              onSubmit={handleNewsletter}
              className="w-full max-w-md flex flex-col sm:flex-row gap-3"
            >
              <input
                type="email"
                placeholder="your@email.com"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                aria-label="Email address"
                required
                autoComplete="email"
                className="flex-1 border-b border-border bg-transparent pb-2 text-sm placeholder:text-muted-foreground/50 outline-none focus:border-foreground transition-colors"
              />
              <button
                type="submit"
                disabled={newsletterDone}
                className="shrink-0 font-mono text-[11px] uppercase tracking-[0.22em] bg-foreground text-background px-5 py-2.5 hover:bg-foreground/90 transition-colors"
              >
                {newsletterDone ? "Subscribed" : "Subscribe"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ===== MANIFESTO STRIP ===== */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1400px] grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
          {[
            { k: "01", t: "Cash on Delivery", s: "Pay when it arrives. No card needed." },
            { k: "02", t: "Free shipping ₹499+", s: "Anywhere in India, no fine print." },
            { k: "03", t: "Seven-day returns", s: "Change of heart? We understand." },
          ].map((m) => (
            <div key={m.k} className="px-8 py-12">
              <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                — {m.k}
              </div>
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
  slug,
  theme,
  eyebrow,
  title,
  subtitle,
  cta,
  image,
  align,
  imagePriority = false,
}: {
  slug: "fashion" | "grocery";
  theme: "fashion" | "grocery";
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  cta: string;
  image: string;
  align: "left" | "right";
  imagePriority?: boolean;
}) {
  return (
    <Link
      to="/category/$slug"
      params={{ slug }}
      data-theme={theme}
      className="group relative overflow-hidden bg-background text-foreground"
    >
      {/* Background image */}
      <motion.img
        src={image}
        alt={`${slug} collection`}
        loading={imagePriority ? "eager" : "lazy"}
        fetchPriority={imagePriority ? "high" : "auto"}
        decoding="async"
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="absolute inset-0 h-full w-full object-cover opacity-70 transition-opacity duration-700 group-hover:opacity-90"
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      {/* Tint */}
      <div
        className={`absolute inset-0 ${
          theme === "fashion" ? "bg-[oklch(0.08_0_0)]/55" : "bg-[oklch(0.22_0.04_60)]/55"
        }`}
      />

      <div
        className={`relative flex h-full min-h-[88vh] flex-col justify-between p-8 sm:p-14 ${align === "right" ? "md:items-end md:text-right" : ""}`}
      >
        <div className="flex items-center justify-between w-full">
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/80">
            {eyebrow}
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/60">
            {theme === "fashion" ? "Editorial" : "Organic"}
          </span>
        </div>

        <div className={`max-w-xl ${align === "right" ? "md:ml-auto" : ""}`}>
          <motion.h2
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
          </motion.h2>
          <p className="mt-6 max-w-md text-white/85 text-base sm:text-lg leading-relaxed">
            {subtitle}
          </p>
          <div
            className={`mt-8 inline-flex items-center gap-3 ${align === "right" ? "md:flex-row-reverse" : ""}`}
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-black transition-transform group-hover:translate-x-1">
              <ArrowUpRight className="h-5 w-5" />
            </span>
            <span className="font-mono text-[12px] uppercase tracking-[0.25em] text-white">
              {cta}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ============ BENTO TILE ============ */

function BentoTile({
  slug,
  title,
  tagline,
  image,
  accentClass,
}: {
  slug: "electronics" | "home" | "beauty";
  title: string;
  tagline: string;
  image: string;
  accentClass: string;
}) {
  return (
    <Link
      to="/category/$slug"
      params={{ slug }}
      className="group relative aspect-[4/5] md:aspect-[3/4] overflow-hidden rounded-2xl bg-muted"
    >
      <img
        src={image}
        alt={title}
        loading="lazy"
        decoding="async"
        sizes="(min-width: 768px) 33vw, 100vw"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute inset-0 p-6 flex flex-col justify-between">
        <span
          className={`self-start rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] ${accentClass}`}
        >
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
