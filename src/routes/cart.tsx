import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2, Minus, Plus, ShoppingBag, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — Maison" }] }),
  component: CartPage,
});

function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal === 0 ? 0 : subtotal >= 499 ? 0 : 49;
  const total = subtotal + shipping;

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
                        className="px-3 py-1.5 hover:bg-muted transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-10 text-center font-mono text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="px-3 py-1.5 hover:bg-muted transition-colors disabled:opacity-40"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-destructive transition-colors"
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
                  Add {formatINR(499 - subtotal)} more for free shipping
                </p>
              )}
            </div>
            <div className="mt-6 border-t border-border pt-5 flex justify-between">
              <span className="font-display text-xl">Total</span>
              <span className="font-mono text-xl font-semibold">{formatINR(total)}</span>
            </div>
            <Link to="/checkout" className="mt-6 block">
              <Button
                size="lg"
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
      </div>
    </div>
  );
}
