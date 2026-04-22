import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
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
    toast.success("Added to basket", { description: `${node.title} · ${selected.title}` });
  };

  return (
    <article className="group flex flex-col">
      <Link
        to="/product/$handle"
        params={{ handle: node.handle }}
        className="relative block aspect-[4/5] overflow-hidden bg-muted"
      >
        {image && (
          <img
            src={image.url}
            alt={image.altText || node.title}
            loading="lazy"
            width={600}
            height={750}
            className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
          />
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 pt-5">
        <div className="flex items-baseline justify-between gap-3">
          <Link to="/product/$handle" params={{ handle: node.handle }} className="min-w-0">
            <h3 className="font-display text-lg leading-snug text-foreground">
              {node.title}
            </h3>
          </Link>
          <span className="shrink-0 text-sm tabular-nums text-foreground">
            {selected ? formatPrice(selected.price.amount, selected.price.currencyCode) : "—"}
          </span>
        </div>

        {node.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{node.description}</p>
        )}

        {variants.length > 1 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {variants.map((v) => (
              <button
                key={v.node.id}
                onClick={() => setSelected(v.node)}
                className={cn(
                  "border px-3 py-1 text-xs transition-colors",
                  selected?.id === v.node.id
                    ? "border-foreground text-foreground"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                )}
              >
                {v.node.title}
              </button>
            ))}
          </div>
        )}

        <div className="pt-3">
          <Button
            onClick={handleAdd}
            disabled={!selected || isLoading}
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-[13px] font-normal text-foreground hover:bg-transparent hover:text-accent group/btn"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                Add to basket
                <span className="ml-2 inline-block transition-transform group-hover/btn:translate-x-1">→</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}
