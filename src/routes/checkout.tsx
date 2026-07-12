import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Lock } from "lucide-react";
import { useSharedCart } from "@/lib/shared-cart";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — ShopEZ" },
      { name: "description", content: "Secure checkout with automatic bill splitting for shared carts." },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { state, totals, clear } = useSharedCart();
  const [placed, setPlaced] = useState(false);
  const [orderId] = useState(() => `SEZ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`);

  if (placed) {
    return (
      <div className="container-page py-20">
        <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success/20 text-success">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="mt-5 font-display text-3xl">Order confirmed</h1>
          <p className="mt-2 text-muted-foreground">
            We've sent each person their share and a receipt. Order <span className="font-medium text-foreground">{orderId}</span>.
          </p>
          <div className="mt-6 space-y-2 text-sm">
            {totals.perMember.map((r) => (
              <div key={r.member.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-2">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.member.color }} />
                  {r.member.name}
                </div>
                <div className="font-medium">${r.amount}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/shop" className="rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground">Keep shopping</Link>
            <Link to="/" className="rounded-full border border-border px-5 py-2.5 text-sm">Back home</Link>
          </div>
        </div>
      </div>
    );
  }

  if (totals.byProduct.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="font-display text-3xl">Your cart is empty</h1>
        <Link to="/shop" className="mt-4 inline-block rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground">Browse shop</Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Checkout</div>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">One checkout, everyone paid.</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <form
          onSubmit={(e) => { e.preventDefault(); setPlaced(true); clear(); }}
          className="space-y-6 rounded-3xl border border-border bg-card p-6"
        >
          <fieldset className="space-y-4">
            <legend className="font-display text-xl">Delivery</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" required />
              <Field label="Email" type="email" required />
              <Field label="Address" required className="sm:col-span-2" />
              <Field label="City" required />
              <Field label="Postal code" required />
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="font-display text-xl">Payment</legend>
            <p className="text-sm text-muted-foreground">
              Each person will receive a secure payment link for their share. You can also pay it all now.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Card number" placeholder="4242 4242 4242 4242" />
              <Field label="Name on card" />
              <Field label="Expiry" placeholder="MM / YY" />
              <Field label="CVC" placeholder="123" />
            </div>
          </fieldset>

          <button className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-soft transition hover:opacity-90">
            <Lock className="h-4 w-4" />
            Place order · ${totals.total}
          </button>
        </form>

        <aside className="rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-xl">Split summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            {totals.perMember.map((r) => (
              <div key={r.member.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.member.color }} />
                  {r.member.name}
                </div>
                <span className="font-medium">${r.amount}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-dashed border-border pt-4 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${totals.subtotal}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>${totals.tax}</span></div>
            <div className="mt-2 flex justify-between border-t border-border pt-2 text-base">
              <span className="font-display text-lg">Total</span>
              <span className="font-display text-lg">${totals.total}</span>
            </div>
          </div>
          <div className="mt-5 text-xs text-muted-foreground">Shared with {state.members.length} people</div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, className = "", ...props }: { label: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <input {...props} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand" />
    </label>
  );
}
