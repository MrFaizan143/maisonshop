import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { storefrontApiRequest, STOREFRONT_QUERY, type ShopifyProduct } from "@/lib/shopify";
import heroImg from "@/assets/hero-stall.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Asansol Momos — Hand-folded, steamed daily" },
      { name: "description", content: "A small stall in Asansol. Hand-folded momos, steamed in bamboo, served fresh." },
      { property: "og:title", content: "Asansol Momos" },
      { property: "og:description", content: "Hand-folded momos, steamed in bamboo, served fresh." },
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
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-32 lg:px-10 lg:pt-32 lg:pb-40">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 lg:pt-12"
          >
            <p className="eyebrow mb-8">Asansol · Est. 2023</p>
            <h1 className="font-display text-[2.75rem] font-light leading-[1.05] tracking-tight text-foreground text-balance sm:text-6xl lg:text-7xl">
              Hand-folded momos,<br />
              <span className="italic text-accent">steamed</span> daily.
            </h1>
            <p className="mt-8 max-w-md text-base leading-relaxed text-muted-foreground">
              A small stall on Burnpur Road. We fold each momo by hand, steam them in bamboo, and serve them with our family-recipe red chutney.
            </p>
            <div className="mt-10 flex items-center gap-8">
              <Link to="/menu">
                <Button className="rounded-none bg-foreground text-background hover:bg-foreground/85 font-normal px-7 h-11">
                  View Menu
                </Button>
              </Link>
              <Link to="/about" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Our story →
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5"
          >
            <img
              src={heroImg}
              alt="Asansol Momos stall at golden hour"
              className="aspect-[4/5] w-full object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* PHILOSOPHY STRIP */}
      <section className="border-y border-border">
        <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
          {[
            { n: "01", title: "Handmade", text: "Each momo folded by hand at dawn, never machine-pressed." },
            { n: "02", title: "Steamed", text: "Bamboo steamers, to order. Never sitting, always fresh." },
            { n: "03", title: "Family Recipe", text: "The same red chutney since day one. We don't change it." },
          ].map((v) => (
            <div key={v.n} className="px-8 py-12 lg:px-10 lg:py-16">
              <p className="eyebrow mb-6">{v.n}</p>
              <h3 className="font-display text-2xl text-foreground">{v.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED MENU */}
      <section className="mx-auto max-w-6xl px-6 py-32 lg:px-10 lg:py-40">
        <div className="mb-16 flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-5">Selection</p>
            <h2 className="font-display text-4xl font-light text-foreground sm:text-5xl">Today's favourites</h2>
          </div>
          <Link to="/menu" className="hidden shrink-0 text-sm text-muted-foreground hover:text-foreground sm:block">
            View all →
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="border border-dashed border-border py-24 text-center text-sm text-muted-foreground">
            Loading menu…
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => <ProductCard key={p.node.id} product={p} />)}
          </div>
        )}
      </section>

      {/* STORY */}
      <section className="border-t border-border">
        <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 py-32 lg:grid-cols-12 lg:gap-20 lg:px-10 lg:py-40">
          <div className="lg:col-span-5">
            <img
              src={heroImg}
              alt="Asansol Momos stall"
              loading="lazy"
              width={800}
              height={1000}
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
          <div className="lg:col-span-7 lg:pl-8">
            <p className="eyebrow mb-6">Our Story</p>
            <h2 className="font-display text-4xl font-light text-foreground text-balance sm:text-5xl">
              A wooden cart that became a <span className="italic text-accent">ritual</span>.
            </h2>
            <p className="mt-8 max-w-md text-base leading-relaxed text-muted-foreground">
              We started in 2023 with one steamer and one recipe. Today we serve hundreds of momos a day, but we still fold every one by hand. Same recipe. Same red chutney. A few more steamers.
            </p>
            <Link to="/about" className="mt-8 inline-block text-sm text-foreground hover:text-accent">
              Read more →
            </Link>
          </div>
        </div>
      </section>

      {/* CATERING */}
      <section className="border-t border-border bg-secondary/40">
        <div className="mx-auto max-w-6xl px-6 py-32 text-center lg:px-10 lg:py-40">
          <p className="eyebrow mb-6">Bulk Orders</p>
          <h2 className="mx-auto max-w-2xl font-display text-4xl font-light text-foreground text-balance sm:text-5xl">
            Feeding a crowd? <span className="italic text-accent">We'll bring the steamers.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            Office lunches, house parties, weddings. We'll steam hundreds and bring them piping hot.
          </p>
          <Link to="/catering" className="mt-10 inline-block">
            <Button className="rounded-none bg-foreground text-background hover:bg-foreground/85 font-normal px-7 h-11">
              Request a Quote
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
