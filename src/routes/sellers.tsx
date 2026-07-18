import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { TrendingUp, Package, DollarSign, Users } from "lucide-react";
import { getSellerStats } from "@/lib/carts.functions";

export const Route = createFileRoute("/sellers")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "For sellers — ShopEZ" },
      { name: "description", content: "The ShopEZ seller dashboard: order management, insightful analytics, and everything you need to grow." },
    ],
  }),
  component: Sellers,
});

function Sellers() {
  const fn = useServerFn(getSellerStats);
  const { data } = useQuery({ queryKey: ["seller-stats"], queryFn: () => fn() });

  const stats = [
    { icon: DollarSign, label: "Revenue · 30d", value: data ? `$${data.revenue.toLocaleString()}` : "—", trend: "live" },
    { icon: Package, label: "Orders · 30d", value: data ? String(data.orderCount) : "—", trend: "live" },
    { icon: Users, label: "Shared carts", value: data ? String(data.sharedCarts) : "—", trend: "live" },
    { icon: TrendingUp, label: "Conversion", value: "4.7%", trend: "+0.6pt" },
  ];

  return (
    <div className="container-page py-12">
      <div className="mb-10">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">For sellers</div>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Grow your shop, effortlessly.</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Live numbers from your Lovable Cloud backend. Every order, every shared cart.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between text-muted-foreground">
              <s.icon className="h-4 w-4" />
              <span className="text-xs text-success">{s.trend}</span>
            </div>
            <div className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
            <div className="mt-1 font-display text-3xl">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-3xl border border-border bg-card p-6">
          <h2 className="mb-4 font-display text-xl">Recent orders</h2>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Cart</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(data?.recent ?? []).length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No orders yet — check out a shared cart to see it here.</td></tr>
                ) : data!.recent.map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-3 font-mono text-xs">{o.id}</td>
                    <td className="px-4 py-3">{o.customer}</td>
                    <td className="px-4 py-3">${o.total}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-accent/40 px-2.5 py-1 text-xs">{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-xl">Insights</h2>
          <ul className="mt-4 space-y-4 text-sm">
            <li className="rounded-xl border border-dashed border-border p-4">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Shared-cart lift</div>
              <div className="mt-1 font-medium">AOV is 2.4× higher when a cart has 2+ people</div>
            </li>
            <li className="rounded-xl border border-dashed border-border p-4">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Try this</div>
              <div className="mt-1 font-medium">Bundle Mineral Mug + Brass Kettle — 62% affinity</div>
            </li>
          </ul>
          <Link to="/" className="mt-6 inline-block text-sm text-brand hover:underline">← Back to storefront</Link>
        </div>
      </div>
    </div>
  );
}
