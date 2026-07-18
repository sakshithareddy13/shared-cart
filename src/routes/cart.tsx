import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2, Plus, Minus, Users, Link as LinkIcon, Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { useSharedCart, useAuth } from "@/lib/shared-cart";

export const Route = createFileRoute("/cart")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Shared cart — ShopEZ" },
      { name: "description", content: "Your shared cart. Everyone adds items, the bill splits itself." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { ready, userId, cart, totals, isLoading, create, rename, kick, setQty, remove, leaveCurrent } = useSharedCart();
  const navigate = useNavigate();
  const [newName, setNewName] = useState("");
  const [copied, setCopied] = useState(false);

  if (!ready || isLoading) {
    return <div className="container-page py-20 text-center text-muted-foreground">Loading…</div>;
  }

  if (!userId) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="font-display text-4xl">Sign in to open a shared cart</h1>
        <p className="mt-2 text-muted-foreground">Carts belong to real accounts so we know who added what.</p>
        <Link to="/auth" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground">Sign in</Link>
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-8 shadow-soft">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">New</div>
          <h1 className="mt-1 font-display text-3xl">Start a shared cart</h1>
          <p className="mt-2 text-sm text-muted-foreground">Give it a name, then share the invite link with friends.</p>
          <div className="mt-5 flex gap-2">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Sunday grocery run"
              className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm" />
            <button
              onClick={() => create.mutate(newName || "Shared cart")}
              disabled={create.isPending}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60">
              Create
            </button>
          </div>
          <JoinBox />
        </div>
      </div>
    );
  }

  const inviteUrl = typeof window !== "undefined" ? `${window.location.origin}/join/${cart.share_code}` : "";
  const isOwner = cart.owner_id === userId;
  const empty = totals.byProduct.length === 0;

  return (
    <div className="container-page py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Shared cart</div>
          <input
            defaultValue={cart.name}
            onBlur={(e) => e.target.value !== cart.name && rename.mutate(e.target.value)}
            className="mt-1 w-full max-w-lg border-none bg-transparent font-display text-4xl outline-none md:text-5xl"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { navigator.clipboard.writeText(inviteUrl); setCopied(true); setTimeout(() => setCopied(false), 1600); toast.success("Invite link copied"); }}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:border-foreground/30"
          >
            {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            Invite · code {cart.share_code}
          </button>
          <button onClick={leaveCurrent} className="rounded-full border border-border px-4 py-2 text-sm hover:border-foreground/30">Switch cart</button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" /> {cart.members.length} people in this cart
          </div>
          <div className="mb-6 flex flex-wrap gap-2">
            {cart.members.map((m) => (
              <div key={m.user_id} className="group flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-sm">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: m.color }} />
                {m.display_name}{m.user_id === cart.owner_id && <span className="text-xs text-muted-foreground">· owner</span>}
                {isOwner && m.user_id !== cart.owner_id && (
                  <button onClick={() => kick.mutate(m.user_id)} className="ml-1 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {empty ? (
            <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
              Nothing here yet. <Link to="/shop" className="text-brand hover:underline">Browse the shop</Link> and add something.
            </div>
          ) : (
            <ul className="divide-y divide-border rounded-3xl border border-border bg-card">
              {totals.byProduct.map((r) => (
                <li key={r.itemId} className="flex items-center gap-4 p-4">
                  <img src={r.product.image} alt={r.product.name} className="h-20 w-20 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{r.product.name}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="h-2 w-2 rounded-full" style={{ background: r.addedBy?.color }} />
                      added by {r.addedBy?.display_name ?? "—"}
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-full border border-border">
                    <button onClick={() => setQty.mutate({ itemId: r.itemId, qty: r.qty - 1 })} className="grid h-8 w-8 place-items-center"><Minus className="h-3.5 w-3.5" /></button>
                    <span className="w-6 text-center text-sm">{r.qty}</span>
                    <button onClick={() => setQty.mutate({ itemId: r.itemId, qty: r.qty + 1 })} className="grid h-8 w-8 place-items-center"><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="w-20 text-right font-medium">${r.line}</div>
                  <button onClick={() => remove.mutate(r.itemId)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <LinkIcon className="h-3.5 w-3.5" /> Split preview
            </div>
            <div className="mt-5 space-y-4">
              {totals.perMember.map((r) => {
                const pct = totals.total > 0 ? Math.round((r.amount / totals.total) * 100) : 0;
                return (
                  <div key={r.member.user_id}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.member.color }} />
                        <span className="font-medium">{r.member.display_name}</span>
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

function JoinBox() {
  const { join } = useSharedCart();
  const [code, setCode] = useState("");
  return (
    <div className="mt-8 border-t border-dashed border-border pt-6">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">Or join a friend's cart</div>
      <div className="mt-3 flex gap-2">
        <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Invite code" maxLength={8}
          className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 font-mono text-sm uppercase tracking-widest" />
        <button
          onClick={() => join.mutate(code, { onError: (e: any) => toast.error(e.message) })}
          disabled={!code || join.isPending}
          className="rounded-full border border-border px-5 py-2.5 text-sm font-medium disabled:opacity-60"
        >Join</button>
      </div>
    </div>
  );
}
