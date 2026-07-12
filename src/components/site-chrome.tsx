import { Link } from "@tanstack/react-router";
import { ShoppingBag, Users } from "lucide-react";
import { useSharedCart } from "@/lib/shared-cart";

export function SiteHeader() {
  const { state, totals } = useSharedCart();
  const itemCount = state.items.reduce((s, i) => s + i.qty, 0);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground font-display text-lg">S</div>
          <div className="leading-tight">
            <div className="font-display text-xl">ShopEZ</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">shop together</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm md:flex">
          <Link to="/" className="text-muted-foreground transition-colors hover:text-foreground [&.active]:text-foreground">Home</Link>
          <Link to="/shop" className="text-muted-foreground transition-colors hover:text-foreground [&.active]:text-foreground">Shop</Link>
          <Link to="/cart" className="text-muted-foreground transition-colors hover:text-foreground [&.active]:text-foreground">Shared cart</Link>
          <Link to="/sellers" className="text-muted-foreground transition-colors hover:text-foreground [&.active]:text-foreground">For sellers</Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs sm:flex">
            <Users className="h-3.5 w-3.5" />
            <span>{state.members.length} in cart</span>
          </div>
          <Link
            to="/cart"
            className="relative inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft transition hover:opacity-90"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">${totals.total}</span>
            {itemCount > 0 && (
              <span className="ml-1 grid h-5 w-5 place-items-center rounded-full bg-accent text-[11px] font-semibold text-accent-foreground">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-secondary/40">
      <div className="container-page grid gap-8 py-12 md:grid-cols-4">
        <div>
          <div className="font-display text-2xl">ShopEZ</div>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            One-stop shopping, made for sharing. Build a cart with friends, split the bill, check out once.
          </p>
        </div>
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Shop</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/shop" className="hover:text-brand">All products</Link></li>
            <li><Link to="/cart" className="hover:text-brand">Shared cart</Link></li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Sellers</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/sellers" className="hover:text-brand">Seller dashboard</Link></li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Get updates</div>
          <form className="flex gap-2">
            <input type="email" placeholder="you@studio.co" className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-brand" />
            <button className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">Join</button>
          </form>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ShopEZ. Shop together, apart.
      </div>
    </footer>
  );
}
