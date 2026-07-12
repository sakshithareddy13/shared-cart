import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Users, Split, ShoppingBag, Sparkles } from "lucide-react";
import { products } from "@/lib/products";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ShopEZ — shop together, split the bill" },
      { name: "description", content: "Build a shared cart with friends and family. Everyone adds items, the total is split automatically, one checkout for all." },
    ],
  }),
  component: Home,
});

function Home() {
  const featured = products.slice(0, 4);
  const trending = products.slice(4, 8);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,oklch(0.9_0.09_75_/_0.5),transparent_60%),radial-gradient(ellipse_at_bottom_left,oklch(0.85_0.09_30_/_0.35),transparent_55%)]" />
        <div className="container-page grid gap-10 pb-20 pt-16 md:grid-cols-2 md:gap-16 md:pb-28 md:pt-24">
          <div className="flex flex-col justify-center">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              <span>New: shared carts with automatic bill splitting</span>
            </div>
            <h1 className="font-display text-5xl leading-[1.05] md:text-7xl">
              Shop together,<br />
              <span className="italic text-brand">split the bill</span> apart.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              ShopEZ is the one-stop online shop where friends and family fill a cart together. Everyone adds what they want. We do the math. One checkout, zero awkwardness.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-pop transition hover:opacity-90">
                Start shopping <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/cart" className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-6 py-3 text-sm font-medium backdrop-blur transition hover:border-foreground/30">
                Open shared cart
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6 text-xs text-muted-foreground">
              <div><span className="font-display text-2xl text-foreground">4.9</span> / 5 average rating</div>
              <div className="h-8 w-px bg-border" />
              <div><span className="font-display text-2xl text-foreground">120k+</span> shared carts checked out</div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden rounded-3xl bg-muted shadow-pop">
              <img
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000&auto=format&fit=crop"
                alt="Two friends shopping together"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-64 rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
                <span>Split preview</span>
                <span>3 friends</span>
              </div>
              <div className="space-y-2">
                {[
                  { n: "You", a: 42, c: "oklch(0.65 0.18 40)" },
                  { n: "Alex", a: 38, c: "oklch(0.6 0.15 200)" },
                  { n: "Sam", a: 27, c: "oklch(0.65 0.16 150)" },
                ].map((r) => (
                  <div key={r.n} className="flex items-center gap-2 text-sm">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.c }} />
                    <span className="flex-1">{r.n}</span>
                    <span className="font-medium">${r.a}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-dashed border-border pt-3 text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-display text-xl">$107</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container-page py-16">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">How it works</div>
            <h2 className="mt-2 font-display text-4xl">Three steps. One checkout.</h2>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: Users, title: "Invite your people", body: "Send a link. Friends, roommates, or family join the same cart from any device." },
            { icon: ShoppingBag, title: "Everyone adds items", body: "Each person picks what they want. Items are tagged so it's always clear who added what." },
            { icon: Split, title: "We split the bill", body: "The total is divided automatically based on each person's items. One checkout, done." },
          ].map((s, i) => (
            <div key={s.title} className="rounded-2xl border border-border/60 bg-card p-6">
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-accent/40 text-accent-foreground">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Step {i + 1}</div>
              <h3 className="mt-1 font-display text-xl">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container-page py-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Featured this week</div>
            <h2 className="mt-2 font-display text-4xl">Handpicked, quietly excellent.</h2>
          </div>
          <Link to="/shop" className="hidden text-sm text-brand hover:underline md:inline">See all →</Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Trending */}
      <section className="container-page py-16">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Trending</div>
          <h2 className="mt-2 font-display text-4xl">Loved by shared carts.</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {trending.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-20">
        <div className="overflow-hidden rounded-3xl bg-primary text-primary-foreground">
          <div className="grid gap-6 p-10 md:grid-cols-[1.4fr_1fr] md:p-16">
            <div>
              <h2 className="font-display text-4xl md:text-5xl">Your cart, but everyone's in it.</h2>
              <p className="mt-4 max-w-lg text-primary-foreground/80">
                Start a shared cart in seconds. No sign-ups, no math, no "who owes who" group chat.
              </p>
            </div>
            <div className="flex items-end justify-start md:justify-end">
              <Link to="/cart" className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:opacity-90">
                Open shared cart <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
