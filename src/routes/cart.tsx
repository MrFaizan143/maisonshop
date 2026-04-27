import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Trash2, Minus, Plus, ShoppingBag, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { formatINR } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { trackEvent } from "@/lib/analytics";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — Maison" }] }),
  component: CartPage,
});

function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal === 0 ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 49;
  const total = subtotal + shipping;
  const [upsell, setUpsell] = useState<ProductCardData[]>([]);
  const inCartIds = useMemo(() => items.map((i) => i.productId), [items]);
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(
    100,
    Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100),
  );

  useEffect(() => {
    if (items.length === 0) return;
    let cancelled = false;
    supabase
      .from("products")
      .select("id, title, slug, price, compare_at_price, image_url, rating, rating_count, stock")
      .eq("active", true)
      .gt("stock", 0)
      .order("featured", { ascending: false })
      .order("rating", { ascending: false, nullsFirst: false })
      .limit(6)
      .then(({ data }) => {
        if (cancelled) return;
        const filtered = ((data ?? []) as ProductCardData[]).filter(
          (p) => !inCartIds.includes(p.id),
        );
        setUpsell(filtered.slice(0, 4));
      });
    return () => {
      cancelled = true;
    };
  }, [items.length, inCartIds]);

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-center px-5 py-32 sm:px-8 text-center">
        <ShoppingBag className="h-14 w-14 text-muted-foreground/30" strokeWidth={1} />
        <h1 className="mt-8 editorial-headline text-5xl sm:text-6xl">Your bag is empty.</h1>
        <p className="mt-4 text-sm text-muted-foreground max-w-xs">
          Browse our collections and add pieces you love.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] hover:underline"
        >
          Explore the store <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background">
      {/* Page header */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 py-12 sm:py-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            — Your bag
          </p>
          <h1 className="mt-3 editorial-headline text-[clamp(2.5rem,7vw,5rem)]">
            {items.length} {items.length === 1 ? "item" : "items"}.
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Items */}
          <div className="space-y-4">
            {items.map((item, i) => (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                className="flex gap-4 border-b border-border pb-6"
              >
                <Link
                  to="/product/$slug"
                  params={{ slug: item.slug }}
                  className="block h-24 w-20 shrink-0 overflow-hidden bg-muted sm:h-28 sm:w-24"
                >
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                  ) : null}
                </Link>
                <div className="flex flex-1 flex-col min-w-0">
                  <Link
                    to="/product/$slug"
                    params={{ slug: item.slug }}
                    className="line-clamp-2 font-display text-lg leading-tight hover:underline"
                  >
                    {item.title}
                  </Link>
                  <div className="mt-1 font-mono text-sm">{formatINR(item.price)}</div>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                    <div className="flex items-center border border-border">
                      <button
                        onClick={() => updateQty(item.productId, item.quantity - 1)}
                        className="grid h-11 w-11 place-items-center hover:bg-muted transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-10 text-center font-mono text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="grid h-11 w-11 place-items-center hover:bg-muted transition-colors disabled:opacity-40"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="flex items-center gap-1.5 px-2 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <aside className="h-fit border border-border bg-card p-6 lg:sticky lg:top-36">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              Order summary
            </h2>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-mono">{shipping === 0 ? "FREE" : formatINR(shipping)}</span>
              </div>
              {shipping > 0 && (
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  Add {formatINR(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping
                </p>
              )}
              <div className="space-y-1.5">
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-foreground transition-all"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {freeShippingRemaining === 0
                    ? "You unlocked free shipping."
                    : `${formatINR(freeShippingRemaining)} away from free shipping`}
                </p>
              </div>
            </div>
            <div className="mt-6 border-t border-border pt-5 flex justify-between">
              <span className="font-display text-xl">Total</span>
              <span className="font-mono text-xl font-semibold">{formatINR(total)}</span>
            </div>
            <Link to="/checkout" className="mt-6 block">
              <Button
                size="lg"
                onClick={() =>
                  trackEvent("begin_checkout", {
                    source: "cart",
                    total,
                    itemCount: items.length,
                  })
                }
                className="w-full bg-foreground text-background hover:bg-foreground/90 font-mono text-[11px] uppercase tracking-[0.22em] rounded-none"
              >
                Proceed to Checkout
              </Button>
            </Link>
            <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Cash on Delivery available
            </p>
          </aside>
        </div>
        {upsell.length > 0 && (
          <section className="mt-12 border-t border-border pt-10">
            <div className="mb-5 flex items-baseline justify-between">
              <h2 className="font-display text-xl sm:text-2xl">Complete your order</h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Recommended add-ons
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6">
              {upsell.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
