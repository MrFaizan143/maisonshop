import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/product-card";

interface Props {
  productId: string;
  categoryId: string | null;
}

export function RelatedProducts({ productId, categoryId }: Props) {
  const [items, setItems] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const q = supabase
      .from("products")
      .select("id, title, slug, price, compare_at_price, image_url, rating, rating_count, stock")
      .eq("active", true)
      .neq("id", productId)
      .limit(8);
    const final = categoryId ? q.eq("category_id", categoryId) : q;
    final.then(({ data }) => {
      if (cancelled) return;
      setItems((data ?? []) as ProductCardData[]);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [productId, categoryId]);

  if (loading || items.length === 0) return null;

  return (
    <section className="mt-12 border-t border-border pt-10">
      <div className="mb-5 flex items-baseline justify-between">
        <h2 className="font-display text-xl sm:text-2xl">You may also like</h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Curated for you
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
