import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice, type ShopifyProduct } from "@/lib/shopify";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const node = product.node;
  const variants = node.variants.edges;
  const [selected, setSelected] = useState(variants[0]?.node);
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);
  const image = node.images.edges[0]?.node;

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
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-warm">
      <Link
        to="/product/$handle"
        params={{ handle: node.handle }}
        className="relative block aspect-square overflow-hidden bg-muted"
      >
        {image && (
          <img
            src={image.url}
            alt={image.altText || node.title}
            loading="lazy"
            width={600}
            height={600}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        {node.productType && (
          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary backdrop-blur">
            {node.productType}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <Link to="/product/$handle" params={{ handle: node.handle }}>
            <h3 className="font-display text-xl font-semibold text-primary transition-colors hover:text-accent">
              {node.title}
            </h3>
          </Link>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{node.description}</p>
        </div>

        {variants.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {variants.map((v) => (
              <button
                key={v.node.id}
                onClick={() => setSelected(v.node)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  selected?.id === v.node.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:border-primary/50",
                )}
              >
                {v.node.title}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <span className="font-display text-2xl font-bold text-primary">
            {selected ? formatPrice(selected.price.amount, selected.price.currencyCode) : "—"}
          </span>
          <Button
            onClick={handleAdd}
            disabled={!selected || isLoading}
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="mr-1 h-4 w-4" />Add</>}
          </Button>
        </div>
      </div>
    </article>
  );
}
