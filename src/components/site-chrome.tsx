import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingBag, Users, LogOut } from "lucide-react";
import { useSharedCart, useAuth } from "@/lib/shared-cart";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export function SiteHeader() {
  const { cart, totals } = useSharedCart();
  const { userId } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const itemCount = cart?.items.reduce((s, i) => s + i.qty, 0) ?? 0;

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

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
          {cart && (
            <div className="hidden items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs sm:flex">
              <Users className="h-3.5 w-3.5" />
              <span>{cart.members.length} in cart</span>
            </div>
          )}
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
          {userId ? (
            <button onClick={signOut} title="Sign out" className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <Link to="/auth" className="rounded-full border border-border px-4 py-2 text-sm hover:border-foreground/30">Sign in</Link>
          )}
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
          <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Company</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/sellers" className="hover:text-brand">For sellers</Link></li>
          </ul>
        </div>
        <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} ShopEZ</div>
      </div>
    </footer>
  );
}
