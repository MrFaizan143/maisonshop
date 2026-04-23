import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/product-card";

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
          { title: `${loaderData.category.name} — ShopHub` },
          { name: "description", content: `Shop ${loaderData.category.name} on ShopHub. Cash on Delivery, free shipping over ₹499.` },
          { property: "og:title", content: `${loaderData.category.name} — ShopHub` },
        ]
      : [],
  }),
  component: CategoryPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">Category not found</h1>
      <Link to="/" className="mt-4 inline-block text-primary underline">Back home</Link>
    </div>
  ),
});

function CategoryPage() {
  const { category } = Route.useLoaderData();
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<"new" | "price_asc" | "price_desc">("new");

  useEffect(() => {
    setLoading(true);
    let q = supabase
      .from("products")
      .select("id, title, slug, price, compare_at_price, image_url, rating, rating_count")
      .eq("active", true)
      .eq("category_id", category.id);
    if (sort === "price_asc") q = q.order("price", { ascending: true });
    else if (sort === "price_desc") q = q.order("price", { ascending: false });
    else q = q.order("created_at", { ascending: false });

    q.then(({ data }) => {
      setProducts((data ?? []) as ProductCardData[]);
      setLoading(false);
    });
  }, [category.id, sort]);

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{category.name}</h1>
        <div className="flex items-center gap-2 text-sm">
          <label className="text-muted-foreground">Sort:</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="rounded-md border border-border bg-card px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="new">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-muted-foreground">Loading...</div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No products in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
