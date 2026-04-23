import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — ShopHub" }] }),
  component: CartPage,
});

function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal());
  const shipping = subtotal === 0 ? 0 : subtotal >= 499 ? 0 : 49;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground/50" />
        <h1 className="mt-4 text-2xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">Browse our products and add your favourites.</p>
        <Link to="/" className="mt-6 inline-block">
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Start shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
      <h1 className="mb-4 text-2xl font-semibold">Shopping Cart</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-3 rounded-lg border border-border bg-card p-3 shadow-card sm:gap-4 sm:p-4"
            >
              <Link
                to="/product/$slug"
                params={{ slug: item.slug }}
                className="block h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted sm:h-24 sm:w-24"
              >
                {item.image ? (
                  <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                ) : null}
              </Link>
              <div className="flex flex-1 flex-col min-w-0">
                <Link
                  to="/product/$slug"
                  params={{ slug: item.slug }}
                  className="line-clamp-2 text-sm font-medium hover:text-primary"
                >
                  {item.title}
                </Link>
                <div className="mt-1 text-base font-bold">{formatINR(item.price)}</div>
                <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                  <div className="flex items-center rounded-md border border-border">
                    <button
                      onClick={() => updateQty(item.productId, item.quantity - 1)}
                      className="px-2 py-1 hover:bg-muted"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-9 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="px-2 py-1 hover:bg-muted disabled:opacity-50"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-xl border border-border bg-card p-5 shadow-card lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">Order Summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium">{shipping === 0 ? "FREE" : formatINR(shipping)}</span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-muted-foreground">Add {formatINR(499 - subtotal)} more for free shipping</p>
            )}
          </div>
          <div className="mt-4 border-t border-border pt-4 flex justify-between text-base font-bold">
            <span>Total</span>
            <span>{formatINR(total)}</span>
          </div>
          <Link to="/checkout" className="mt-5 block">
            <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
              Proceed to Checkout
            </Button>
          </Link>
          <p className="mt-3 text-xs text-center text-muted-foreground">Cash on Delivery available</p>
        </aside>
      </div>
    </div>
  );
}
