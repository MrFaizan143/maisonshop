import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { cn } from "@/lib/utils";
import { PRODUCT_SELECT } from "@/lib/constants";

type ThemeKey = "fashion" | "grocery" | "electronics" | "home" | "beauty";

export const Route = createFileRoute("/category/$slug")({
  loader: async ({ params }) => {
    const { data: cat } = await supabase
      .from("categories")
      .select("id, name, slug, image_url")
      .eq("slug", params.slug)
      .maybeSingle();
    if (!cat) throw notFound();
    return { category: cat };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.category.name} — Maison` },
          {
            name: "description",
            content: `Shop ${loaderData.category.name} at Maison. Cash on Delivery, free shipping over ₹499.`,
          },
          { property: "og:title", content: `${loaderData.category.name} — Maison` },
          ...(loaderData.category.image_url
            ? [{ property: "og:image", content: loaderData.category.image_url }]
            : []),
        ]
      : [],
  }),
  component: CategoryPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="editorial-headline text-5xl">Not found</h1>
      <Link
        to="/"
        className="mt-6 inline-block font-mono text-[11px] uppercase tracking-[0.2em] underline"
      >
        Back home
      </Link>
    </div>
  ),
});

const THEME_COPY: Record<ThemeKey, { eyebrow: string; tagline: string; descriptor: string }> = {
  fashion: {
    eyebrow: "Vol. 01 — Fashion",
    tagline: "An editorial of intent.",
    descriptor: "Asymmetric grids, oversized type, considered silhouettes.",
  },
  grocery: {
    eyebrow: "Vol. 02 — Food",
    tagline: "From the soil, to the table.",
    descriptor: "Seasonal produce, slow pantry, ingredients with a story.",
  },
  electronics: {
    eyebrow: "Vol. 03 — Electronics",
    tagline: "Sharp tools, sharper ideas.",
    descriptor: "Devices that disappear into the work.",
  },
  home: {
    eyebrow: "Vol. 04 — Home",
    tagline: "Objects for a slower life.",
    descriptor: "Warm materials, soft edges, made to last.",
  },
  beauty: {
    eyebrow: "Vol. 05 — Beauty",
    tagline: "Quiet rituals.",
    descriptor: "Formulations and tools for a thoughtful routine.",
  },
};

function CategoryPage() {
  const { category } = Route.useLoaderData();
  const slug = category.slug as ThemeKey;
  const copy = THEME_COPY[slug] ?? {
    eyebrow: category.name,
    tagline: category.name,
    descriptor: "",
  };
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<"new" | "price_asc" | "price_desc" | "rating">("new");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceBand, setPriceBand] = useState<"all" | "lt499" | "499to1499" | "gte1500">("all");

  useEffect(() => {
    setLoading(true);
    let q = supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("active", true)
      .eq("category_id", category.id);
    if (inStockOnly) q = q.gt("stock", 0);
    if (priceBand === "lt499") q = q.lt("price", 499);
    else if (priceBand === "499to1499") q = q.gte("price", 499).lte("price", 1499);
    else if (priceBand === "gte1500") q = q.gte("price", 1500);
    if (sort === "price_asc") q = q.order("price", { ascending: true });
    else if (sort === "price_desc") q = q.order("price", { ascending: false });
    else if (sort === "rating") q = q.order("rating", { ascending: false, nullsFirst: false });
    else q = q.order("created_at", { ascending: false });

    q.then(({ data }) => {
      setProducts((data ?? []) as ProductCardData[]);
      setLoading(false);
    });
  }, [category.id, sort, inStockOnly, priceBand]);

  const isFashion = slug === "fashion";
  const isFood = slug === "grocery";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={slug}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="bg-background text-foreground"
      >
        {/* ===== Themed hero ===== */}
        <section
          className={cn("relative overflow-hidden border-b border-border", isFood && "grain")}
        >
          {category.image_url && (
            <div className="absolute inset-0">
              <img
                src={category.image_url}
                alt={`${category.name} collection`}
                className="h-full w-full object-cover opacity-25"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
            </div>
          )}
          <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8 py-20 sm:py-28">
            <div
              className={cn(
                "flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground",
              )}
            >
              <span>{copy.eyebrow}</span>
              <span>{products.length} pieces</span>
            </div>

            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "mt-8 max-w-4xl",
                isFashion && "editorial-headline text-[clamp(3.5rem,11vw,10rem)]",
                isFood && "organic-headline text-[clamp(3rem,9vw,8rem)]",
                !isFashion &&
                  !isFood &&
                  "font-display text-[clamp(3rem,8vw,7rem)] font-medium tracking-tight",
              )}
            >
              {copy.tagline}
            </motion.h1>

            <p className="mt-6 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              {copy.descriptor}
            </p>
          </div>
        </section>

        {/* ===== Toolbar ===== */}
        <div className="sticky top-24 z-20 border-b border-border bg-background/85 backdrop-blur">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 sm:px-8 py-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              {category.name} · {products.length}
            </div>
            <div className="flex items-center gap-3">
              <label className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground hidden sm:inline">
                Sort
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className={cn(
                  "border border-border bg-card px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring",
                  isFood ? "rounded-full" : isFashion ? "rounded-none" : "rounded-md",
                )}
              >
                <option value="new">Newest</option>
                <option value="price_asc">Price ↑</option>
                <option value="price_desc">Price ↓</option>
                <option value="rating">Top rated</option>
              </select>
              <select
                value={priceBand}
                onChange={(e) => setPriceBand(e.target.value as typeof priceBand)}
                className={cn(
                  "border border-border bg-card px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring",
                  isFood ? "rounded-full" : isFashion ? "rounded-none" : "rounded-md",
                )}
              >
                <option value="all">All prices</option>
                <option value="lt499">Under ₹499</option>
                <option value="499to1499">₹499–₹1499</option>
                <option value="gte1500">₹1500+</option>
              </select>
              <label className="inline-flex items-center gap-2 text-xs sm:text-sm">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="h-4 w-4 accent-foreground"
                />
                In stock
              </label>
            </div>
          </div>
        </div>

        {/* ===== Products ===== */}
        <section className="mx-auto max-w-[1400px] px-5 sm:px-8 py-12 sm:py-16">
          {loading ? (
            <div className="py-20 text-center font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              Loading the collection…
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center">
              <p className="font-display text-2xl">Nothing here yet.</p>
              <p className="mt-2 text-sm text-muted-foreground">Check back soon.</p>
            </div>
          ) : isFashion ? (
            <FashionGrid products={products} />
          ) : isFood ? (
            <FoodGrid products={products} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </motion.div>
    </AnimatePresence>
  );
}

/* ===== FASHION — asymmetric magazine grid ===== */
function FashionGrid({ products }: { products: ProductCardData[] }) {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {products.map((p, i) => {
        // Asymmetric pattern: large, small-small, medium, etc.
        const pattern = i % 6;
        const span =
          pattern === 0
            ? "col-span-12 md:col-span-7"
            : pattern === 1
              ? "col-span-6 md:col-span-5"
              : pattern === 2
                ? "col-span-6 md:col-span-4"
                : pattern === 3
                  ? "col-span-6 md:col-span-4"
                  : pattern === 4
                    ? "col-span-12 md:col-span-4"
                    : "col-span-12 md:col-span-8";
        const aspect =
          pattern === 0 || pattern === 5
            ? "aspect-[16/10]"
            : pattern === 1
              ? "aspect-[3/4]"
              : "aspect-[4/5]";
        return (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: (i % 4) * 0.05 }}
            className={span}
          >
            <Link to="/product/$slug" params={{ slug: p.slug }} className="group block">
              <div className={cn("relative overflow-hidden bg-muted", aspect)}>
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-muted-foreground text-xs">
                    No image
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-border pt-3">
                <h3 className="font-editorial text-xl leading-tight">{p.title}</h3>
                <div className="font-mono text-sm whitespace-nowrap">
                  ₹{p.price.toLocaleString("en-IN")}
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ===== FOOD — organic rounded card grid ===== */
function FoodGrid({ products }: { products: ProductCardData[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((p, i) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: (i % 3) * 0.08 }}
        >
          <Link
            to="/product/$slug"
            params={{ slug: p.slug }}
            className="group block overflow-hidden rounded-[2rem] bg-card border border-border shadow-card hover:shadow-pop transition-all"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-b-[2rem] bg-muted">
              {p.image_url ? (
                <img
                  src={p.image_url}
                  alt={p.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                />
              ) : (
                <div className="grid h-full place-items-center text-muted-foreground text-xs">
                  No image
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                — Pantry
              </div>
              <h3 className="mt-2 font-display text-2xl italic leading-tight">{p.title}</h3>
              <div className="mt-4 flex items-center justify-between">
                <div className="font-display text-xl">₹{p.price.toLocaleString("en-IN")}</div>
                <div className="rounded-full bg-accent text-accent-foreground px-4 py-2 text-[11px] font-mono uppercase tracking-[0.2em]">
                  Add
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
