import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/product-card";

const searchSchema = z.object({
  q: z.string().optional(),
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

function SearchPage() {
  const { q } = Route.useSearch();
  const [results, setResults] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) {
      setResults([]);
      return;
    }
    setLoading(true);
    supabase
      .from("products")
      .select("id, title, slug, price, compare_at_price, image_url, rating, rating_count, stock")
      .eq("active", true)
      .or(`title.ilike.%${q}%,description.ilike.%${q}%,brand.ilike.%${q}%`)
      .limit(60)
      .then(({ data }) => {
        setResults((data ?? []) as ProductCardData[]);
        setLoading(false);
      });
  }, [q]);

  return (
    <div className="bg-background text-foreground">
      {/* Header */}
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
        </div>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-[1400px] px-5 sm:px-8 py-12 sm:py-16">
        {!loading && results.length === 0 && q ? (
          <div className="py-24 text-center">
            <p className="font-display text-3xl text-muted-foreground/50">Nothing found.</p>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Try a different term or browse our categories.
            </p>
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
