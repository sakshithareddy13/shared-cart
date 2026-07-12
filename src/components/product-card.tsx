import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { priceAfterDiscount, type Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const finalPrice = priceAfterDiscount(product);
  return (
    <Link
      to="/product/$id"
      params={{ id: product.id }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all hover:-translate-y-0.5 hover:shadow-soft"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.discount && (
          <span className="absolute left-3 top-3 rounded-full bg-brand px-2.5 py-1 text-[11px] font-semibold text-brand-foreground">
            −{product.discount}%
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{product.category}</div>
        <h3 className="font-display text-lg leading-snug">{product.name}</h3>
        <div className="mt-auto flex items-end justify-between pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold">${finalPrice}</span>
            {product.discount && <span className="text-sm text-muted-foreground line-through">${product.price}</span>}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
            {product.rating} <span className="opacity-60">({product.reviews})</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
