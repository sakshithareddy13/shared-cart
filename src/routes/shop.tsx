import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { products } from "@/lib/products";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop all — ShopEZ" },
      { name: "description", content: "Browse the full ShopEZ catalog. Home, kitchen, apparel, footwear and more — with detailed descriptions, reviews and discounts." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const cats = ["All", ...Array.from(new Set(products.map((p) => p.category)))];
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState("featured");

  let list = cat === "All" ? products : products.filter((p) => p.category === cat);
  if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
  if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);

  return (
    <div className="container-page py-12">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Catalog</div>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Everything, in one shared cart.</h1>
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-y border-border/60 py-4">
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-foreground/30"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-full border border-border bg-background px-4 py-1.5 text-sm outline-none"
        >
          <option value="featured">Featured</option>
          <option value="price-asc">Price · low to high</option>
          <option value="price-desc">Price · high to low</option>
          <option value="rating">Top rated</option>
        </select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
