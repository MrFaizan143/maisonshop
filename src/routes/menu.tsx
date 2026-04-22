import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { storefrontApiRequest, STOREFRONT_QUERY, type ShopifyProduct } from "@/lib/shopify";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — Asansol Momos" },
      { name: "description", content: "Browse our full menu: steamed, fried, tandoori and soup momos. Order online for pickup or delivery." },
      { property: "og:title", content: "Menu — Asansol Momos" },
      { property: "og:description", content: "Steamed, fried, tandoori and soup momos. Order online." },
    ],
  }),
  component: MenuPage,
});

const CATEGORIES = ["All", "Steamed", "Fried", "Tandoori", "Soup", "Combos"] as const;

function MenuPage() {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [vegOnly, setVegOnly] = useState(false);

  useEffect(() => {
    storefrontApiRequest(STOREFRONT_QUERY, { first: 50, query: null })
      .then((data) => setProducts(data?.data?.products?.edges ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const type = p.node.productType?.toLowerCase() ?? "";
      const tags = (p.node.tags ?? []).map((t) => t.toLowerCase());
      const matchCat = category === "All" || type.includes(category.toLowerCase());
      const matchVeg = !vegOnly || tags.includes("veg");
      return matchCat && matchVeg;
    });
  }, [products, category, vegOnly]);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-12 pb-24 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-accent">Our Menu</p>
        <h1 className="font-display text-5xl font-bold text-primary sm:text-6xl">Pick your momos</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Everything is hand-folded and steamed to order. Choose your portion, add to basket, and we'll get steaming.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                category === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:border-primary/40",
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <Button
          variant={vegOnly ? "default" : "outline"}
          onClick={() => setVegOnly((v) => !v)}
          size="sm"
          className={vegOnly ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}
        >
          🌱 Veg only
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center">
          <h2 className="font-display text-2xl text-primary">No products found</h2>
          <p className="mt-2 text-muted-foreground">
            Try a different category, or ask us in the chat to add new momos to your menu.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => <ProductCard key={p.node.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
