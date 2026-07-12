import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, Trash2, UserPlus, Share2, ShoppingBag, X } from "lucide-react";
import { toast } from "sonner";
import { useSharedCart } from "@/lib/shared-cart";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Shared cart — ShopEZ" },
      { name: "description", content: "Everyone in your shared cart adds what they want. The total splits automatically." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const navigate = useNavigate();
  const {
    state, totals,
    updateQty, removeItem,
    addMember, removeMember, setCurrentMember, setCartName, clear,
  } = useSharedCart();
  const [newName, setNewName] = useState("");

  const empty = totals.byProduct.length === 0;

  return (
    <div className="container-page py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Shared cart</div>
          <input
            value={state.cartName}
            onChange={(e) => setCartName(e.target.value)}
            className="mt-1 w-full max-w-lg bg-transparent font-display text-4xl outline-none md:text-5xl"
          />
        </div>
        <button
          onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success("Cart link copied"); }}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm hover:border-foreground/30"
        >
          <Share2 className="h-4 w-4" /> Share cart link
        </button>
      </div>

      {/* Members */}
      <section className="mb-8 rounded-3xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl">In this cart</h2>
            <p className="text-sm text-muted-foreground">Tap a name to add items on their behalf.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {state.members.map((m) => (
            <div
              key={m.id}
              className={`group flex items-center gap-2 rounded-full border py-1.5 pl-3 pr-1.5 text-sm transition ${
                state.currentMemberId === m.id ? "border-foreground bg-background" : "border-border bg-background/50"
              }`}
            >
              <button onClick={() => setCurrentMember(m.id)} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: m.color }} />
                {m.name}
                {state.currentMemberId === m.id && <span className="text-[10px] uppercase tracking-widest text-muted-foreground">active</span>}
              </button>
              {state.members.length > 1 && (
                <button
                  onClick={() => removeMember(m.id)}
                  className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground opacity-0 transition hover:bg-muted hover:text-foreground group-hover:opacity-100"
                  aria-label={`Remove ${m.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
          <form
            onSubmit={(e) => { e.preventDefault(); if (!newName.trim()) return; addMember(newName.trim()); setNewName(""); }}
            className="flex items-center gap-1 rounded-full border border-dashed border-border bg-background/40 py-1.5 pl-3 pr-1.5"
          >
            <UserPlus className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Invite name"
              className="w-28 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button className="rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">Add</button>
          </form>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* Items */}
        <section className="rounded-3xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl">Items ({totals.byProduct.length})</h2>
            {!empty && (
              <button onClick={() => { clear(); toast("Cart cleared"); }} className="text-xs text-muted-foreground hover:text-destructive">Clear all</button>
            )}
          </div>

          {empty ? (
            <div className="grid place-items-center gap-3 py-16 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-muted"><ShoppingBag className="h-6 w-6 text-muted-foreground" /></div>
              <p className="text-muted-foreground">Your shared cart is empty.</p>
              <Link to="/shop" className="mt-2 rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground">Browse the shop</Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {totals.byProduct.map((row) => (
                <li key={row.product.id} className="flex gap-4 py-4">
                  <img src={row.product.image} alt={row.product.name} className="h-24 w-24 rounded-xl object-cover" />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{row.product.category}</div>
                        <Link to="/product/$id" params={{ id: row.product.id }} className="font-display text-lg hover:underline">{row.product.name}</Link>
                      </div>
                      <button onClick={() => removeItem(row.product.id)} className="text-muted-foreground hover:text-destructive" aria-label="Remove">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span className="h-2 w-2 rounded-full" style={{ background: row.addedBy?.color }} />
                      <span className="text-muted-foreground">Added by {row.addedBy?.name ?? "—"}</span>
                    </div>
                    <div className="mt-auto flex items-end justify-between pt-3">
                      <div className="inline-flex items-center rounded-full border border-border">
                        <button onClick={() => updateQty(row.product.id, row.qty - 1)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted"><Minus className="h-3.5 w-3.5" /></button>
                        <span className="w-8 text-center text-sm">{row.qty}</span>
                        <button onClick={() => updateQty(row.product.id, row.qty + 1)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted"><Plus className="h-3.5 w-3.5" /></button>
                      </div>
                      <div className="font-medium">${row.line}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Summary */}
        <aside className="flex flex-col gap-6">
          <div className="rounded-3xl border border-border bg-card p-6">
            <h2 className="font-display text-xl">Bill split</h2>
            <p className="text-sm text-muted-foreground">Auto-calculated from each person's items.</p>

            <div className="mt-5 space-y-4">
              {totals.perMember.map((r) => {
                const pct = totals.total > 0 ? Math.round((r.amount / totals.total) * 100) : 0;
                return (
                  <div key={r.member.id}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.member.color }} />
                        <span className="font-medium">{r.member.name}</span>
                        <span className="text-xs text-muted-foreground">· {r.items} items</span>
                      </div>
                      <div className="font-medium">${r.amount}</div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: r.member.color }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 space-y-2 border-t border-dashed border-border pt-4 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${totals.subtotal}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tax (8%)</span><span>${totals.tax}</span></div>
              <div className="flex justify-between border-t border-border pt-2 text-base">
                <span className="font-display text-lg">Total</span>
                <span className="font-display text-lg">${totals.total}</span>
              </div>
            </div>

            <button
              disabled={empty}
              onClick={() => navigate({ to: "/checkout" })}
              className="mt-6 w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-soft transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Checkout together
            </button>
          </div>

          <div className="rounded-3xl border border-dashed border-border p-6 text-sm text-muted-foreground">
            <div className="mb-1 font-medium text-foreground">How the split works</div>
            Each person pays for the items they added, plus their share of tax. Fair, transparent, and no group-chat math.
          </div>
        </aside>
      </div>
    </div>
  );
}
