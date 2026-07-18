import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Star, Check, Users, Plus } from "lucide-react";
import { toast } from "sonner";
import { products, priceAfterDiscount } from "@/lib/products";
import { useSharedCart, useAuth } from "@/lib/shared-cart";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const product = products.find((p) => p.id === params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    return {
      meta: [
        { title: p ? `${p.name} — ShopEZ` : "Product — ShopEZ" },
        { name: "description", content: p?.description ?? "Product on ShopEZ." },
        { property: "og:title", content: p?.name ?? "Product" },
        { property: "og:description", content: p?.description ?? "" },
        ...(p ? [{ property: "og:image", content: p.image }, { name: "twitter:image", content: p.image }] : []),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-3xl">Product not found</h1>
      <Link to="/shop" className="mt-4 inline-block text-brand">Back to shop</Link>
    </div>
  ),
  component: ProductPage,
});

const REVIEWS = [
  { name: "Priya M.", stars: 5, body: "Better than expected. The quality shows and it arrived quickly." },
  { name: "Jordan L.", stars: 4, body: "Really nice. Docked one star because the color is slightly warmer than in photos." },
  { name: "Marco R.", stars: 5, body: "Bought two — one for me, one as a gift. Both loved." },
];

function ProductPage() {
  const { product } = Route.useLoaderData();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { cart, add, create, totals } = useSharedCart();
  const finalPrice = priceAfterDiscount(product);
  const inCart = totals.byProduct.find((r) => r.product.id === product.id);

  async function handleAdd() {
    if (!userId) { navigate({ to: "/auth" }); return; }
    try {
      if (!cart) {
        await create.mutateAsync("Shared cart");
        // Retry add after cart exists — refetch cycle will land it
      }
      await add.mutateAsync(product.id);
      toast.success(`Added ${product.name}`);
    } catch (e: any) { toast.error(e.message ?? "Could not add"); }
  }

  return (
    <div className="container-page py-10">
      <nav className="mb-6 text-xs text-muted-foreground">
        <Link to="/shop" className="hover:text-foreground">Shop</Link> / <span>{product.category}</span> / <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl bg-muted shadow-soft">
          <img src={product.image} alt={product.name} className="aspect-square w-full object-cover" />
        </div>

        <div className="flex flex-col">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">{product.category}</div>
          <h1 className="mt-2 font-display text-4xl md:text-5xl">{product.name}</h1>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.round(product.rating) ? "fill-accent text-accent" : "text-muted-foreground/40"}`} />
              ))}
              <span className="ml-1 text-muted-foreground">{product.rating} · {product.reviews} reviews</span>
            </div>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-4xl">${finalPrice}</span>
            {product.discount && (
              <>
                <span className="text-lg text-muted-foreground line-through">${product.price}</span>
                <span className="rounded-full bg-brand px-2 py-0.5 text-xs font-semibold text-brand-foreground">Save {product.discount}%</span>
              </>
            )}
          </div>

          <p className="mt-6 text-muted-foreground">{product.description}</p>

          <ul className="mt-6 space-y-2 text-sm">
            {product.features.map((f: string) => (
              <li key={f} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 text-success" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 rounded-2xl border border-border bg-secondary/40 p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              {cart ? `Adding to "${cart.name}" · ${cart.members.length} member${cart.members.length === 1 ? "" : "s"}` : "Adding will start a shared cart"}
            </div>
            <button
              onClick={handleAdd}
              disabled={add.isPending || create.isPending}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-soft transition hover:opacity-90 disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              Add to shared cart {inCart && `(${inCart.qty} in cart)`}
            </button>
          </div>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="font-display text-3xl">What people are saying</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <div key={r.name} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < r.stars ? "fill-accent text-accent" : "text-muted-foreground/40"}`} />
                ))}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">"{r.body}"</p>
              <div className="mt-3 text-xs font-medium">— {r.name}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
