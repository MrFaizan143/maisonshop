import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/product-card";

const searchSchema = z.object({
  q: z.string().optional(),
});

export const Route = createFileRoute("/search")({
  validateSearch: searchSchema,
  head: ({ search }) => ({
    meta: [
      { title: search.q ? `Search: ${search.q} — ShopHub` : "Search — ShopHub" },
      { name: "description", content: `Search results for ${search.q ?? "products"}.` },
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
      .select("id, title, slug, price, compare_at_price, image_url, rating, rating_count")
      .eq("active", true)
      .or(`title.ilike.%${q}%,description.ilike.%${q}%,brand.ilike.%${q}%`)
      .limit(60)
      .then(({ data }) => {
        setResults((data ?? []) as ProductCardData[]);
        setLoading(false);
      });
  }, [q]);

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
      <h1 className="mb-1 text-2xl font-semibold">
        {q ? `Results for "${q}"` : "Search"}
      </h1>
      <p className="mb-4 text-sm text-muted-foreground">
        {loading ? "Searching..." : `${results.length} product${results.length === 1 ? "" : "s"} found`}
      </p>

      {!loading && results.length === 0 && q && (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No products match your search.</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {results.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
