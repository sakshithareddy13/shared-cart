import { useEffect, useMemo, useState, type ReactNode, createContext, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { products, priceAfterDiscount, type Product } from "./products";
import {
  getCart, createCart, renameCart, joinCartByCode, removeMember,
  addItem, updateItemQty, removeItem, placeOrder,
  type CartDTO, type CartMemberDTO,
} from "./carts.functions";

const CART_STORAGE_KEY = "shopez.currentCartId";

type AuthCtx = { userId: string | null; ready: boolean };
const AuthContext = createContext<AuthCtx>({ userId: null, ready: false });

export function useAuth() { return useContext(AuthContext); }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthCtx>({ userId: null, ready: false });
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setState({ userId: data.session?.user.id ?? null, ready: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setState({ userId: session?.user.id ?? null, ready: true });
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

// Backwards-compat wrapper (was SharedCartProvider). No context needed now,
// but keep the export so __root.tsx doesn't break.
export function SharedCartProvider({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

export type CartTotals = {
  subtotal: number;
  tax: number;
  total: number;
  perMember: { member: CartMemberDTO; amount: number; items: number }[];
  byProduct: { itemId: string; product: Product; qty: number; line: number; addedBy?: CartMemberDTO }[];
};

export function useSharedCart() {
  const { userId, ready } = useAuth();
  const qc = useQueryClient();
  const [cartId, setCartId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setCartId(localStorage.getItem(CART_STORAGE_KEY));
  }, []);

  const persistCartId = (id: string | null) => {
    setCartId(id);
    if (typeof window !== "undefined") {
      if (id) localStorage.setItem(CART_STORAGE_KEY, id);
      else localStorage.removeItem(CART_STORAGE_KEY);
    }
  };

  const getCartFn = useServerFn(getCart);
  const createCartFn = useServerFn(createCart);
  const renameFn = useServerFn(renameCart);
  const joinFn = useServerFn(joinCartByCode);
  const removeMemberFn = useServerFn(removeMember);
  const addItemFn = useServerFn(addItem);
  const updateQtyFn = useServerFn(updateItemQty);
  const removeItemFn = useServerFn(removeItem);
  const placeOrderFn = useServerFn(placeOrder);

  const query = useQuery({
    queryKey: ["cart", cartId, userId],
    enabled: !!cartId && !!userId,
    queryFn: () => getCartFn({ data: { cartId: cartId! } }) as Promise<CartDTO | null>,
  });

  const cart = query.data ?? null;
  useEffect(() => {
    // Auto-clear stale id if the cart was deleted or checked-out
    if (cartId && query.isFetched && cart === null) persistCartId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartId, query.isFetched, cart]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["cart"] });

  const totals: CartTotals = useMemo(() => {
    if (!cart) return { subtotal: 0, tax: 0, total: 0, perMember: [], byProduct: [] };
    const byProduct = cart.items.map((it) => {
      const product = products.find((p) => p.id === it.product_id);
      if (!product) return null;
      const line = priceAfterDiscount(product) * it.qty;
      const addedBy = cart.members.find((m) => m.user_id === it.added_by);
      return { itemId: it.id, product, qty: it.qty, line, addedBy };
    }).filter(Boolean) as CartTotals["byProduct"];
    const subtotal = byProduct.reduce((s, r) => s + r.line, 0);
    const tax = Math.round(subtotal * 0.08);
    const total = subtotal + tax;
    const perMember = cart.members.map((m) => {
      const mine = byProduct.filter((r) => r.addedBy?.user_id === m.user_id);
      const mySubtotal = mine.reduce((s, r) => s + r.line, 0);
      const share = subtotal > 0 ? mySubtotal / subtotal : 1 / Math.max(cart.members.length, 1);
      return { member: m, amount: Math.round(total * share), items: mine.reduce((s, r) => s + r.qty, 0) };
    });
    return { subtotal, tax, total, perMember, byProduct };
  }, [cart]);

  const create = useMutation({
    mutationFn: (name?: string) => createCartFn({ data: { name } }) as Promise<any>,
    onSuccess: (c: any) => { persistCartId(c.id); invalidate(); },
  });
  const rename = useMutation({
    mutationFn: (name: string) => renameFn({ data: { cartId: cart!.id, name } }),
    onSuccess: invalidate,
  });
  const join = useMutation({
    mutationFn: (code: string) => joinFn({ data: { code } }) as Promise<{ cartId: string }>,
    onSuccess: (r) => { persistCartId(r.cartId); invalidate(); },
  });
  const kick = useMutation({
    mutationFn: (uid: string) => removeMemberFn({ data: { cartId: cart!.id, userId: uid } }),
    onSuccess: invalidate,
  });
  const add = useMutation({
    mutationFn: (productId: string) => addItemFn({ data: { cartId: cart!.id, productId } }),
    onSuccess: invalidate,
  });
  const setQty = useMutation({
    mutationFn: (v: { itemId: string; qty: number }) => updateQtyFn({ data: v }),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (itemId: string) => removeItemFn({ data: { itemId } }),
    onSuccess: invalidate,
  });
  const checkout = useMutation({
    mutationFn: () => placeOrderFn({ data: { cartId: cart!.id } }) as Promise<any>,
    onSuccess: () => { invalidate(); },
  });

  const switchTo = (id: string) => persistCartId(id);
  const leaveCurrent = () => persistCartId(null);

  return {
    ready,
    userId,
    cartId,
    cart,
    totals,
    isLoading: query.isLoading,
    create, rename, join, kick, add, setQty, remove, checkout,
    switchTo, leaveCurrent,
  };
}
