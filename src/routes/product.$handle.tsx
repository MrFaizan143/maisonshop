import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import {
  PRODUCT_BY_HANDLE_QUERY,
  formatPrice,
  storefrontApiRequest,
  type ShopifyProduct,
} from "@/lib/shopify";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$handle")({
  loader: async ({ params }) => {
    const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle: params.handle });
    const product = data?.data?.product;
    if (!product) throw notFound();
    return { product: { node: product } as ShopifyProduct };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.node.title} — Asansol Momos` },
          { name: "description", content: loaderData.product.node.description.slice(0, 160) },
          { property: "og:title", content: `${loaderData.product.node.title} — Asansol Momos` },
          { property: "og:description", content: loaderData.product.node.description.slice(0, 160) },
          { property: "og:image", content: loaderData.product.node.images.edges[0]?.node.url ?? "" },
        ]
      : [],
  }),
  component: ProductPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="font-display text-3xl text-primary">Couldn't load this momo</h1>
      <p className="mt-2 text-muted-foreground">{error.message}</p>
      <Link to="/menu" className="mt-6 inline-block">
        <Button>Back to Menu</Button>
      </Link>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="font-display text-3xl text-primary">Momo not found</h1>
      <Link to="/menu" className="mt-6 inline-block">
        <Button>Back to Menu</Button>
      </Link>
    </div>
  ),
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const node = product.node;
  const variants = node.variants.edges;
  const [selected, setSelected] = useState(variants[0]?.node);
  const [activeImg, setActiveImg] = useState(node.images.edges[0]?.node.url);
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);

  const handleAdd = async () => {
    if (!selected) return;
    await addItem({
      product,
      variantId: selected.id,
      variantTitle: selected.title,
      price: selected.price,
      quantity: 1,
      selectedOptions: selected.selectedOptions || [],
    });
    toast.success("Added to your basket", { description: `${node.title} (${selected.title})` });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-24 sm:px-6 lg:px-8">
      <Link to="/menu" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to Menu
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-3xl bg-muted shadow-warm">
            {activeImg && (
              <img src={activeImg} alt={node.title} className="aspect-square w-full object-cover" />
            )}
          </div>
          {node.images.edges.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-2">
              {node.images.edges.map((img) => (
                <button
                  key={img.node.url}
                  onClick={() => setActiveImg(img.node.url)}
                  className={cn(
                    "aspect-square overflow-hidden rounded-lg border-2 transition-colors",
                    activeImg === img.node.url ? "border-primary" : "border-transparent",
                  )}
                >
                  <img src={img.node.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          {node.productType && (
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              {node.productType}
            </p>
          )}
          <h1 className="mt-2 font-display text-4xl font-bold text-primary sm:text-5xl">{node.title}</h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">{node.description}</p>

          {variants.length > 1 && (
            <div className="mt-8">
              <p className="mb-2 text-sm font-semibold text-foreground">Portion</p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.node.id}
                    onClick={() => setSelected(v.node)}
                    className={cn(
                      "rounded-full border-2 px-5 py-2 text-sm font-medium transition-all",
                      selected?.id === v.node.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:border-primary/40",
                    )}
                  >
                    {v.node.title} · {formatPrice(v.node.price.amount, v.node.price.currencyCode)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Total</p>
              <p className="font-display text-3xl font-bold text-primary">
                {selected ? formatPrice(selected.price.amount, selected.price.currencyCode) : "—"}
              </p>
            </div>
            <Button onClick={handleAdd} disabled={!selected || isLoading} size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="mr-1 h-4 w-4" />Add to Basket</>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
