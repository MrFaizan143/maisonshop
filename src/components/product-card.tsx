import { Link } from "@tanstack/react-router";
import { Star, Plus, GripVertical } from "lucide-react";
import { formatINR, discountPct } from "@/lib/format";
import { useCartStore } from "@/stores/cart-store";
import { useDragToCart } from "@/components/drag-to-cart-provider";
import { toast } from "sonner";

export interface ProductCardData {
  id: string;
  title: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  image_url: string | null;
  rating: number | null;
  rating_count: number;
  stock: number;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const discount = discountPct(product.price, product.compare_at_price);
  const addItem = useCartStore((s) => s.addItem);
  const { bindHandle } = useDragToCart();
  const dragHandle = bindHandle({
    productId: product.id,
    title: product.title,
    slug: product.slug,
    price: product.price,
    image: product.image_url,
    stock: product.stock,
  });

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(
      {
        productId: product.id,
        title: product.title,
        slug: product.slug,
        price: product.price,
        image: product.image_url,
        stock: product.stock,
      },
      1,
    );
    toast.success("Added to cart", { description: product.title });
  };

  return (
    <Link to="/product/$slug" params={{ slug: product.slug }} className="group flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid h-full place-items-center text-muted-foreground text-xs">
            No image
          </div>
        )}
        {discount && (
          <span className="absolute top-3 left-3 bg-foreground text-background px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em]">
            −{discount}%
          </span>
        )}
        {/* Quick-add button */}
        <button
          onClick={handleQuickAdd}
          className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-black shadow-md opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-white"
          aria-label={`Add ${product.title} to cart`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-border pt-3">
        <div className="min-w-0">
          <h3 className="line-clamp-2 font-display text-base leading-tight">{product.title}</h3>
          {product.rating != null && product.rating > 0 && (
            <div className="mt-1 flex items-center gap-1">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.round(product.rating!)
                        ? "fill-foreground text-foreground"
                        : "fill-none text-muted-foreground/40"
                    }`}
                  />
                ))}
              </div>
              {product.rating_count > 0 && (
                <span className="font-mono text-[10px] text-muted-foreground">
                  ({product.rating_count})
                </span>
              )}
            </div>
          )}
        </div>
        <div className="text-right whitespace-nowrap shrink-0">
          <div className="font-mono text-sm">{formatINR(product.price)}</div>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <div className="font-mono text-[11px] text-muted-foreground line-through">
              {formatINR(product.compare_at_price)}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
