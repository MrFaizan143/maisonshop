import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/product-card";

const SORTS = ["relevance", "price_asc", "price_desc", "rating", "newest"] as const;
type Sort = (typeof SORTS)[number];

const searchSchema = z.object({
  q: z.string().optional(),
  sort: z.enum(SORTS).optional(),
  in_stock: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((v): boolean | undefined =>
      v === undefined ? undefined : v === true || v === "true" || v === "1",
    ),
});

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>) => searchSchema.parse(s),
  head: ({ match }) => ({
    meta: [
      { title: match.search.q ? `Search: ${match.search.q} — Maison` : "Search — Maison" },
      { name: "description", content: `Search results for ${match.search.q ?? "products"}.` },
    ],
  }),
  component: SearchPage,
});

const SORT_LABEL: Record<Sort, string> = {
  relevance: "Relevance",
  price_asc: "Price: low to high",
  price_desc: "Price: high to low",
  rating: "Top rated",
  newest: "Newest",
};

function SearchPage() {
  const { q, sort, in_stock } = Route.useSearch();
  const navigate = useNavigate();
  const activeSort: Sort = sort ?? "relevance";
  const [results, setResults] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("maison-recent-searches");
      setRecentSearches(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      setRecentSearches([]);
    }
  }, []);

  const updateSearch = (patch: { sort?: Sort; in_stock?: boolean }) => {
    navigate({
      to: "/search",
      search: (prev) => ({ ...prev, ...patch }),
    });
  };

  useEffect(() => {
    if (!q) {
      setResults([]);
      return;
    }
    setLoading(true);
    const safe = q.replace(/[,()*\\]/g, " ").trim().slice(0, 100);
    if (!safe) {
      setResults([]);
      setLoading(false);
      return;
    }
    const term = `%${safe}%`;
    let cancelled = false;
    let req = supabase
      .from("products")
      .select("id, title, slug, price, compare_at_price, image_url, rating, rating_count, stock")
      .eq("active", true)
      .or(`title.ilike.${term},description.ilike.${term},brand.ilike.${term}`)
      .limit(60);
    if (in_stock) req = req.gt("stock", 0);
    if (activeSort === "price_asc") req = req.order("price", { ascending: true });
    else if (activeSort === "price_desc") req = req.order("price", { ascending: false });
    else if (activeSort === "rating") req = req.order("rating", { ascending: false, nullsFirst: false });
    else if (activeSort === "newest") req = req.order("created_at", { ascending: false });
    req.then(({ data }) => {
      if (cancelled) return;
      setResults((data ?? []) as ProductCardData[]);
      setLoading(false);
      if (safe) {
        setRecentSearches((prev) => {
          const next = [safe, ...prev.filter((s) => s.toLowerCase() !== safe.toLowerCase())].slice(0, 6);
          try {
            localStorage.setItem("maison-recent-searches", JSON.stringify(next));
          } catch {
            // ignore
          }
          return next;
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [q, activeSort, in_stock]);

  const hasResults = useMemo(() => results.length > 0, [results]);

  return (
    <div className="bg-background text-foreground">
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 py-16 sm:py-20">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            — Search
          </p>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 editorial-headline text-[clamp(2.5rem,8vw,6rem)]"
          >
            {q ? (
              <>
                <span className="text-muted-foreground/40">"</span>
                {q}
                <span className="text-muted-foreground/40">"</span>
              </>
            ) : (
              "What are you looking for?"
            )}
          </motion.h1>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {loading
              ? "Searching the collection…"
              : q
                ? `${results.length} result${results.length === 1 ? "" : "s"} found`
                : "Enter a term above to begin"}
          </p>
          {!q && recentSearches.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {recentSearches.map((item) => (
                <button
                  key={item}
                  onClick={() => navigate({ to: "/search", search: (prev) => ({ ...prev, q: item }) })}
                  className="rounded-full border border-border px-3 py-1 text-xs hover:bg-muted"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {q && (
        <section className="border-b border-border">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-5 py-4 sm:px-8">
            <label className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Sort
            </label>
            <select
              value={activeSort}
              onChange={(e) => updateSearch({ sort: e.target.value as Sort })}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
            >
              {SORTS.map((s) => (
                <option key={s} value={s}>
                  {SORT_LABEL[s]}
                </option>
              ))}
            </select>
            <label className="ml-2 inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!in_stock}
                onChange={(e) => updateSearch({ in_stock: e.target.checked })}
                className="h-4 w-4 accent-foreground"
              />
              In stock only
            </label>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-[1400px] px-5 sm:px-8 py-12 sm:py-16">
        {!loading && !hasResults && q ? (
          <div className="py-24 text-center">
            <p className="font-display text-3xl text-muted-foreground/50">Nothing found.</p>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Try a different term or browse our categories.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {["fashion", "grocery", "electronics", "home", "beauty"].map((slug) => (
                <button
                  key={slug}
                  onClick={() => navigate({ to: "/search", search: (prev) => ({ ...prev, q: slug }) })}
                  className="rounded-full border border-border px-3 py-1 text-xs hover:bg-muted"
                >
                  Try “{slug}”
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6">
            {results.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: (i % 8) * 0.04 }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
