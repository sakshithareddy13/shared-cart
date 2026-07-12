import { createFileRoute, Link } from "@tanstack/react-router";
import { TrendingUp, Package, DollarSign, Users } from "lucide-react";

export const Route = createFileRoute("/sellers")({
  head: () => ({
    meta: [
      { title: "For sellers — ShopEZ" },
      { name: "description", content: "The ShopEZ seller dashboard: order management, insightful analytics, and everything you need to grow." },
    ],
  }),
  component: Sellers,
});

const orders = [
  { id: "SEZ-9K21A", customer: "Priya M. + 2", total: 214, status: "Packed" },
  { id: "SEZ-8H03F", customer: "Marco R.", total: 68, status: "Shipped" },
  { id: "SEZ-8G91C", customer: "Alex L. + 3", total: 486, status: "Processing" },
  { id: "SEZ-8G14B", customer: "Sam T.", total: 129, status: "Delivered" },
];

function Sellers() {
  return (
    <div className="container-page py-12">
      <div className="mb-10">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">For sellers</div>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Grow your shop, effortlessly.</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          A calm, powerful dashboard for managing orders, understanding customers, and spotting what's next.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { icon: DollarSign, label: "Revenue · 30d", value: "$48,920", trend: "+12.4%" },
          { icon: Package, label: "Orders", value: "1,284", trend: "+8.1%" },
          { icon: Users, label: "Shared carts", value: "612", trend: "+31%" },
          { icon: TrendingUp, label: "Conversion", value: "4.7%", trend: "+0.6pt" },
        ].map((s) => (
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
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl">Recent orders</h2>
            <button className="text-xs text-brand hover:underline">Export CSV</button>
          </div>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-3 font-mono text-xs">{o.id}</td>
                    <td className="px-4 py-3">{o.customer}</td>
                    <td className="px-4 py-3">${o.total}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-accent/40 px-2.5 py-1 text-xs">{o.status}</span>
                    </td>
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
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Top mover</div>
              <div className="mt-1 font-medium">Aurora Ceramic Lamp — sold out 3× this month</div>
            </li>
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
