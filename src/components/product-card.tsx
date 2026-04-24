import { Link } from "@tanstack/react-router";
import { formatINR, discountPct } from "@/lib/format";

export interface ProductCardData {
  id: string;
  title: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  image_url: string | null;
  rating: number | null;
  rating_count: number;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const discount = discountPct(product.price, product.compare_at_price);

  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      className="group flex flex-col"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid h-full place-items-center text-muted-foreground text-xs">No image</div>
        )}
        {discount && (
          <span className="absolute top-3 left-3 bg-foreground text-background px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em]">
            −{discount}%
          </span>
        )}
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-border pt-3">
        <h3 className="line-clamp-2 font-display text-base leading-tight">
          {product.title}
        </h3>
        <div className="text-right whitespace-nowrap">
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
