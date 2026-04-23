import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
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
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-card transition-all hover:shadow-pop hover:-translate-y-0.5"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs">
            No image
          </div>
        )}
        {discount && (
          <span className="absolute top-2 left-2 rounded bg-deal px-2 py-0.5 text-[11px] font-bold text-white">
            -{discount}%
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground min-h-[2.5rem]">
          {product.title}
        </h3>
        {product.rating != null && product.rating > 0 && (
          <div className="flex items-center gap-1 text-xs">
            <span className="flex items-center gap-0.5 rounded bg-success/15 px-1.5 py-0.5 text-success font-semibold">
              {product.rating.toFixed(1)} <Star className="h-3 w-3 fill-current" />
            </span>
            <span className="text-muted-foreground">({product.rating_count})</span>
          </div>
        )}
        <div className="mt-auto flex items-baseline gap-2">
          <span className="text-base font-bold text-foreground">{formatINR(product.price)}</span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="text-xs text-muted-foreground line-through">
              {formatINR(product.compare_at_price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
