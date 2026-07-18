import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { products, priceAfterDiscount } from "./products";

const COLORS = [
  "oklch(0.65 0.18 40)",
  "oklch(0.6 0.15 200)",
  "oklch(0.65 0.16 150)",
  "oklch(0.6 0.2 320)",
  "oklch(0.7 0.17 90)",
  "oklch(0.6 0.18 20)",
];

function makeCode(len = 6) {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export type CartMemberDTO = { user_id: string; display_name: string; color: string };
export type CartItemDTO = { id: string; product_id: string; qty: number; added_by: string };
export type CartDTO = {
  id: string;
  name: string;
  share_code: string;
  owner_id: string;
  status: string;
  members: CartMemberDTO[];
  items: CartItemDTO[];
};

async function loadCart(supabase: any, cartId: string): Promise<CartDTO | null> {
  const { data: cart } = await supabase.from("carts").select("*").eq("id", cartId).maybeSingle();
  if (!cart) return null;
  const [{ data: memberRows }, { data: itemRows }] = await Promise.all([
    supabase.from("cart_members").select("user_id,color").eq("cart_id", cartId),
    supabase.from("cart_items").select("id,product_id,qty,added_by").eq("cart_id", cartId),
  ]);
  const userIds = Array.from(new Set([cart.owner_id, ...(memberRows ?? []).map((m: any) => m.user_id)]));
  const { data: profs } = await supabase.from("profiles").select("id,display_name").in("id", userIds);
  const nameById = new Map<string, string>((profs ?? []).map((p: any) => [p.id, p.display_name]));
  const colorById = new Map<string, string>((memberRows ?? []).map((m: any) => [m.user_id, m.color]));
  const members: CartMemberDTO[] = userIds.map((uid, idx) => ({
    user_id: uid,
    display_name: nameById.get(uid) ?? "Shopper",
    color: colorById.get(uid) ?? COLORS[idx % COLORS.length],
  }));
  return { id: cart.id, name: cart.name, share_code: cart.share_code, owner_id: cart.owner_id, status: cart.status, members, items: itemRows ?? [] };
}

export const getMyCarts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: owned } = await context.supabase.from("carts").select("id,name,share_code,owner_id,created_at").eq("owner_id", context.userId);
    const { data: memberOf } = await context.supabase.from("cart_members").select("cart_id, carts:cart_id(id,name,share_code,owner_id,created_at)").eq("user_id", context.userId);
    const joined = (memberOf ?? []).map((r: any) => r.carts).filter(Boolean);
    const all = [...(owned ?? []), ...joined];
    const seen = new Set<string>();
    return all.filter((c: any) => (seen.has(c.id) ? false : (seen.add(c.id), true)));
  });

export const getCart = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { cartId: string }) => z.object({ cartId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => loadCart(context.supabase, data.cartId));

export const createCart = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { name?: string }) => z.object({ name: z.string().min(1).max(80).optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const share_code = makeCode();
    const { data: cart, error } = await context.supabase
      .from("carts")
      .insert({ owner_id: context.userId, name: data.name ?? "Shared cart", share_code })
      .select("*").single();
    if (error) throw new Error(error.message);
    await context.supabase.from("cart_members").insert({ cart_id: cart.id, user_id: context.userId, color: COLORS[0] });
    return cart;
  });

export const renameCart = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { cartId: string; name: string }) => z.object({ cartId: z.string().uuid(), name: z.string().min(1).max(80) }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("carts").update({ name: data.name }).eq("id", data.cartId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const joinCartByCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { code: string }) => z.object({ code: z.string().min(4).max(12) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: cart, error } = await context.supabase.from("carts").select("id,owner_id").eq("share_code", data.code.toUpperCase()).maybeSingle();
    if (error) throw new Error(error.message);
    if (!cart) throw new Error("Invite code not found");
    const { count } = await context.supabase.from("cart_members").select("*", { count: "exact", head: true }).eq("cart_id", cart.id);
    const color = COLORS[((count ?? 0) + 1) % COLORS.length];
    await context.supabase.from("cart_members").upsert({ cart_id: cart.id, user_id: context.userId, color }, { onConflict: "cart_id,user_id" });
    return { cartId: cart.id };
  });

export const removeMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { cartId: string; userId: string }) => z.object({ cartId: z.string().uuid(), userId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await context.supabase.from("cart_items").delete().eq("cart_id", data.cartId).eq("added_by", data.userId);
    const { error } = await context.supabase.from("cart_members").delete().eq("cart_id", data.cartId).eq("user_id", data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const addItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { cartId: string; productId: string }) => z.object({ cartId: z.string().uuid(), productId: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: existing } = await context.supabase.from("cart_items").select("id,qty")
      .eq("cart_id", data.cartId).eq("product_id", data.productId).eq("added_by", context.userId).maybeSingle();
    if (existing) {
      await context.supabase.from("cart_items").update({ qty: existing.qty + 1 }).eq("id", existing.id);
    } else {
      const { error } = await context.supabase.from("cart_items")
        .insert({ cart_id: data.cartId, product_id: data.productId, added_by: context.userId, qty: 1 });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const updateItemQty = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { itemId: string; qty: number }) => z.object({ itemId: z.string().uuid(), qty: z.number().int().min(0).max(999) }).parse(d))
  .handler(async ({ data, context }) => {
    if (data.qty <= 0) {
      await context.supabase.from("cart_items").delete().eq("id", data.itemId);
    } else {
      await context.supabase.from("cart_items").update({ qty: data.qty }).eq("id", data.itemId);
    }
    return { ok: true };
  });

export const removeItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { itemId: string }) => z.object({ itemId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await context.supabase.from("cart_items").delete().eq("id", data.itemId);
    return { ok: true };
  });

export const placeOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { cartId: string }) => z.object({ cartId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const cart = await loadCart(context.supabase, data.cartId);
    if (!cart) throw new Error("Cart not found");
    if (cart.items.length === 0) throw new Error("Cart is empty");
    const lines = cart.items.map((it) => {
      const p = products.find((x) => x.id === it.product_id);
      const price = p ? priceAfterDiscount(p) : 0;
      return { added_by: it.added_by, qty: it.qty, line: price * it.qty };
    });
    const subtotal = lines.reduce((s, l) => s + l.line, 0);
    const tax = Math.round(subtotal * 0.08);
    const total = subtotal + tax;
    const order_code = "SEZ-" + makeCode(6);
    const { data: order, error: oErr } = await context.supabase.from("orders")
      .insert({ cart_id: cart.id, order_code, subtotal, tax, total, placed_by: context.userId })
      .select("*").single();
    if (oErr) throw new Error(oErr.message);
    const splits = cart.members.map((m) => {
      const memberLines = lines.filter((l) => l.added_by === m.user_id);
      const memberSubtotal = memberLines.reduce((s, l) => s + l.line, 0);
      const share = subtotal > 0 ? memberSubtotal / subtotal : 1 / cart.members.length;
      return { order_id: order.id, user_id: m.user_id, amount: Math.round(total * share), items: memberLines.reduce((s, l) => s + l.qty, 0) };
    });
    if (splits.length) await context.supabase.from("order_splits").insert(splits);
    await context.supabase.from("cart_items").delete().eq("cart_id", cart.id);
    await context.supabase.from("carts").update({ status: "checked_out" }).eq("id", cart.id);
    return { orderId: order.id, orderCode: order_code, total, subtotal, tax, splits };
  });

export const getSellerStats = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [{ data: orders }, { count: cartCount }, { data: recent }] = await Promise.all([
    supabaseAdmin.from("orders").select("total,cart_id,created_at").gte("created_at", new Date(Date.now() - 30 * 864e5).toISOString()),
    supabaseAdmin.from("carts").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("orders").select("order_code,total,cart_id,created_at,carts:cart_id(name)").order("created_at", { ascending: false }).limit(6),
  ]);
  const revenue = (orders ?? []).reduce((s: number, o: any) => s + (o.total ?? 0), 0);
  return {
    revenue,
    orderCount: (orders ?? []).length,
    sharedCarts: cartCount ?? 0,
    recent: (recent ?? []).map((o: any) => ({ id: o.order_code, total: o.total, customer: o.carts?.name ?? "Cart", status: "Processing" })),
  };
});
