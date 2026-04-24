import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Star, ShoppingCart, Truck, Wallet, RotateCcw, ShieldCheck, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCartStore } from "@/stores/cart-store";
import { formatINR, discountPct } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("products")
      .select("*, categories(name, slug)")
      .eq("slug", params.slug)
      .eq("active", true)
      .maybeSingle();
    if (!data) throw notFound();
    return { product: data };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.title} — ShopHub` },
          { name: "description", content: loaderData.product.description.slice(0, 160) || `Buy ${loaderData.product.title} on ShopHub.` },
          { property: "og:title", content: loaderData.product.title },
          { property: "og:description", content: loaderData.product.description.slice(0, 160) },
          ...(loaderData.product.image_url ? [{ property: "og:image", content: loaderData.product.image_url }] : []),
        ]
      : [],
  }),
  component: ProductPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">Product not found</h1>
      <Link to="/" className="mt-4 inline-block text-primary underline">Back home</Link>
    </div>
  ),
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);
  const allImages: string[] = product.image_url
    ? [product.image_url, ...(product.images ?? [])].filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
    : (product.images ?? []);
  const [activeImg, setActiveImg] = useState<string | null>(allImages[0] ?? null);

  const discount = discountPct(Number(product.price), product.compare_at_price ? Number(product.compare_at_price) : null);

  const handleAdd = () => {
    addItem(
      {
        productId: product.id,
        title: product.title,
        slug: product.slug,
        price: Number(product.price),
        image: product.image_url,
        stock: product.stock,
      },
      qty,
    );
    toast.success("Added to cart", { description: `${qty} × ${product.title}` });
  };

  const inStock = product.stock > 0;

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
      <nav className="mb-3 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        {product.categories && (
          <>
            {" / "}
            <Link to="/category/$slug" params={{ slug: product.categories.slug }} className="hover:text-foreground">
              {product.categories.name}
            </Link>
          </>
        )}
        {" / "}<span className="text-foreground">{product.title}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
        {/* Images */}
        <div className="rounded-xl bg-card p-3 sm:p-5 shadow-card">
          <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted">
            {activeImg ? (
              <img src={activeImg} alt={product.title} className="h-full w-full object-contain" />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">No image</div>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {allImages.map((url) => (
                <button
                  key={url}
                  onClick={() => setActiveImg(url)}
                  className={cn(
                    "aspect-square overflow-hidden rounded-md border-2 bg-muted",
                    activeImg === url ? "border-primary" : "border-transparent hover:border-border",
                  )}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          {product.brand && (
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{product.brand}</p>
          )}
          <h1 className="mt-1 text-2xl font-semibold leading-tight sm:text-3xl">{product.title}</h1>

          {product.rating != null && product.rating > 0 && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1 rounded bg-success/15 px-2 py-0.5 text-success font-semibold">
                {Number(product.rating).toFixed(1)} <Star className="h-3.5 w-3.5 fill-current" />
              </span>
              <span className="text-muted-foreground">{product.rating_count} ratings</span>
            </div>
          )}

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatINR(Number(product.price))}</span>
            {product.compare_at_price && Number(product.compare_at_price) > Number(product.price) && (
              <>
                <span className="text-base text-muted-foreground line-through">
                  {formatINR(Number(product.compare_at_price))}
                </span>
                {discount && <span className="text-sm font-semibold text-deal">{discount}% off</span>}
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Inclusive of all taxes</p>

          <div className="mt-4 flex items-center gap-2">
            {inStock ? (
              <span className="text-sm font-semibold text-success">● In Stock</span>
            ) : (
              <span className="text-sm font-semibold text-deal">● Out of Stock</span>
            )}
          </div>

          {inStock && (
            <div className="mt-5 flex items-center gap-3">
              <span className="text-sm font-medium">Quantity</span>
              <div className="flex items-center rounded-md border border-border">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-2 py-1.5 hover:bg-muted"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="px-2 py-1.5 hover:bg-muted"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={handleAdd}
              disabled={!inStock}
              size="lg"
              className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
            >
              <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
            </Button>
            <Link to="/cart" className="flex-1">
              <Button
                disabled={!inStock}
                size="lg"
                onClick={() => inStock && handleAdd()}
                className="w-full bg-deal text-white hover:bg-deal/90 font-semibold"
              >
                Buy Now
              </Button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-6 grid grid-cols-2 gap-3 rounded-lg border border-border bg-card p-3">
            {[
              { icon: Truck, t: "Free shipping", s: "Orders over ₹499" },
              { icon: Wallet, t: "Cash on Delivery", s: "Pay on receipt" },
              { icon: RotateCcw, t: "7-day returns", s: "Easy returns" },
              { icon: ShieldCheck, t: "Secure", s: "Verified seller" },
            ].map((f) => (
              <div key={f.t} className="flex items-start gap-2 text-xs">
                <f.icon className="h-4 w-4 text-accent mt-0.5" />
                <div>
                  <div className="font-semibold">{f.t}</div>
                  <div className="text-muted-foreground">{f.s}</div>
                </div>
              </div>
            ))}
          </div>

          {product.description && (
            <div className="mt-6">
              <h2 className="text-base font-semibold">About this item</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
