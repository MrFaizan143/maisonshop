import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Star,
  ShoppingCart,
  Truck,
  Wallet,
  RotateCcw,
  ShieldCheck,
  Minus,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCartStore } from "@/stores/cart-store";
import { formatINR, discountPct } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { RelatedProducts } from "@/components/related-products";
import { trackEvent } from "@/lib/analytics";
import { pushRecentlyViewed } from "@/lib/recently-viewed";
import { DELIVERY_ESTIMATE_DAYS } from "@/lib/constants";
import { serializeJsonLd } from "@/lib/safe-json-ld";

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
          { title: `${loaderData.product.title} — Maison` },
          {
            name: "description",
            content:
              (loaderData.product.description ?? "").slice(0, 160) ||
              `Buy ${loaderData.product.title} on Maison.`,
          },
          { property: "og:title", content: loaderData.product.title },
          {
            property: "og:description",
            content: (loaderData.product.description ?? "").slice(0, 160),
          },
          { name: "twitter:title", content: loaderData.product.title },
          {
            name: "twitter:description",
            content: (loaderData.product.description ?? "").slice(0, 160),
          },
          ...(loaderData.product.image_url
            ? [{ property: "og:image", content: loaderData.product.image_url }]
            : []),
        ]
      : [],
  }),
  component: ProductPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">Product not found</h1>
      <Link to="/" className="mt-4 inline-block text-primary underline">
        Back home
      </Link>
    </div>
  ),
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const addItem = useCartStore((s) => s.addItem);
  const cartCount = useCartStore((s) => s.totalCount());
  const navigate = Route.useNavigate();
  const [qty, setQty] = useState(1);
  const allImages: string[] = product.image_url
    ? [product.image_url, ...(product.images ?? [])].filter(
        (v: string, i: number, a: string[]) => a.indexOf(v) === i,
      )
    : (product.images ?? []);
  const [activeImg, setActiveImg] = useState<string | null>(allImages[0] ?? null);

  const discount = discountPct(
    Number(product.price),
    product.compare_at_price ? Number(product.compare_at_price) : null,
  );

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
    trackEvent("add_to_cart", {
      productId: product.id,
      slug: product.slug,
      title: product.title,
      qty,
      price: Number(product.price),
      source: "product_page",
    });
  };

  const inStock = product.stock > 0;
  const lowStock = inStock && product.stock <= 5;
  const estimatedDelivery = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + DELIVERY_ESTIMATE_DAYS);
    return date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  }, []);

  useEffect(() => {
    pushRecentlyViewed({
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: Number(product.price),
      image_url: product.image_url,
      compare_at_price: product.compare_at_price,
      rating: product.rating,
      rating_count: product.rating_count,
      stock: product.stock,
    });
    trackEvent("view_product", { productId: product.id, slug: product.slug, title: product.title });
  }, [product]);

  const handleBuyNow = () => {
    if (!inStock) return;
    trackEvent("begin_checkout", {
      source: "buy_now",
      productId: product.id,
      slug: product.slug,
      qty,
      total: Number(product.price) * qty,
    });
    handleAdd();
    navigate({ to: "/checkout" });
  };

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 pb-28 sm:px-6 sm:py-6 sm:pb-6">
      <nav className="mb-3 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        {product.categories && (
          <>
            {" / "}
            <Link
              to="/category/$slug"
              params={{ slug: product.categories.slug }}
              className="hover:text-foreground"
            >
              {product.categories.name}
            </Link>
          </>
        )}
        {" / "}
        <span className="text-foreground">{product.title}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
        {/* Images */}
        <div className="rounded-xl bg-card p-3 sm:p-5 shadow-card">
          <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted">
            {activeImg ? (
              <img src={activeImg} alt={product.title} className="h-full w-full object-contain" />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                No image
              </div>
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
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {product.brand}
            </p>
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
            {product.compare_at_price &&
              Number(product.compare_at_price) > Number(product.price) && (
                <>
                  <span className="text-base text-muted-foreground line-through">
                    {formatINR(Number(product.compare_at_price))}
                  </span>
                  {discount && (
                    <span className="text-sm font-semibold text-deal">{discount}% off</span>
                  )}
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
            {lowStock && (
              <span className="text-xs font-semibold text-deal">Only {product.stock} left</span>
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
              className="btn-premium-secondary flex-1"
            >
              <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
            </Button>
            <Button
              type="button"
              onClick={handleBuyNow}
              disabled={!inStock}
              size="lg"
              className="btn-premium-primary flex-1 bg-deal text-white hover:bg-deal/90"
            >
              Buy Now
            </Button>
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

          <div className="mt-5 rounded-lg border border-border bg-muted/40 p-3 text-sm">
            <p>
              Delivery by <span className="font-semibold">{estimatedDelivery}</span> · 7-day returns
              · COD available
            </p>
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

      <RelatedProducts
        productId={product.id}
        categoryId={product.category_id}
        brand={product.brand}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.title,
            description: product.description,
            image: allImages,
            sku: product.id,
            brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
            offers: {
              "@type": "Offer",
              priceCurrency: "INR",
              price: Number(product.price),
              availability: inStock
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            },
            aggregateRating:
              product.rating != null && product.rating > 0
                ? {
                    "@type": "AggregateRating",
                    ratingValue: Number(product.rating).toFixed(1),
                    reviewCount: product.rating_count,
                  }
                : undefined,
          }),
        }}
      />

      {inStock && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 p-3 shadow-lg backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">{product.title}</p>
              <p className="font-mono text-sm font-semibold">
                {formatINR(Number(product.price) * qty)} · Qty {qty}
              </p>
            </div>
            <Button
              onClick={handleAdd}
              size="sm"
              className="btn-premium-secondary"
            >
              Add
            </Button>
            <Button
              type="button"
              onClick={handleBuyNow}
              size="sm"
              className="btn-premium-primary bg-deal text-white hover:bg-deal/90"
            >
              Buy now
            </Button>
            {cartCount > 0 && (
              <Link
                to="/cart"
                className="rounded-md border border-border px-2 py-1.5 text-xs text-muted-foreground"
              >
                Cart ({cartCount})
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
