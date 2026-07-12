import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { products, priceAfterDiscount, type Product } from "./products";

export type Member = { id: string; name: string; color: string };
export type CartItem = { productId: string; qty: number; addedBy: string };

type CartState = {
  cartName: string;
  members: Member[];
  items: CartItem[];
  currentMemberId: string;
};

const COLORS = [
  "oklch(0.65 0.18 40)",
  "oklch(0.6 0.15 200)",
  "oklch(0.65 0.16 150)",
  "oklch(0.6 0.2 320)",
  "oklch(0.7 0.17 90)",
  "oklch(0.6 0.18 20)",
];

const STORAGE_KEY = "shopez.sharedcart.v1";

const defaultState: CartState = {
  cartName: "Sunday Grocery Run",
  members: [
    { id: "m1", name: "You", color: COLORS[0] },
    { id: "m2", name: "Alex", color: COLORS[1] },
    { id: "m3", name: "Sam", color: COLORS[2] },
  ],
  items: [],
  currentMemberId: "m1",
};

type Ctx = {
  state: CartState;
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  addMember: (name: string) => void;
  removeMember: (id: string) => void;
  setCurrentMember: (id: string) => void;
  setCartName: (n: string) => void;
  clear: () => void;
  totals: {
    subtotal: number;
    tax: number;
    total: number;
    perMember: { member: Member; amount: number; items: number }[];
    byProduct: { product: Product; qty: number; line: number; addedBy: Member | undefined }[];
  };
};

const CartCtx = createContext<Ctx | null>(null);

export function SharedCartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...defaultState, ...JSON.parse(raw) });
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const value = useMemo<Ctx>(() => {
    const byProduct = state.items
      .map((it) => {
        const product = products.find((p) => p.id === it.productId);
        if (!product) return null;
        const line = priceAfterDiscount(product) * it.qty;
        const addedBy = state.members.find((m) => m.id === it.addedBy);
        return { product, qty: it.qty, line, addedBy };
      })
      .filter(Boolean) as Ctx["totals"]["byProduct"];

    const subtotal = byProduct.reduce((s, r) => s + r.line, 0);
    const tax = Math.round(subtotal * 0.08);
    const total = subtotal + tax;

    const perMember = state.members.map((m) => {
      const memberItems = byProduct.filter((r) => r.addedBy?.id === m.id);
      const memberSubtotal = memberItems.reduce((s, r) => s + r.line, 0);
      const share = subtotal > 0 ? memberSubtotal / subtotal : 1 / Math.max(state.members.length, 1);
      return {
        member: m,
        amount: Math.round(total * share),
        items: memberItems.reduce((s, r) => s + r.qty, 0),
      };
    });

    return {
      state,
      addItem: (productId) =>
        setState((s) => {
          const existing = s.items.find((i) => i.productId === productId && i.addedBy === s.currentMemberId);
          if (existing) {
            return {
              ...s,
              items: s.items.map((i) => (i === existing ? { ...i, qty: i.qty + 1 } : i)),
            };
          }
          return { ...s, items: [...s.items, { productId, qty: 1, addedBy: s.currentMemberId }] };
        }),
      removeItem: (productId) =>
        setState((s) => ({ ...s, items: s.items.filter((i) => i.productId !== productId) })),
      updateQty: (productId, qty) =>
        setState((s) => ({
          ...s,
          items: qty <= 0
            ? s.items.filter((i) => i.productId !== productId)
            : s.items.map((i) => (i.productId === productId ? { ...i, qty } : i)),
        })),
      addMember: (name) =>
        setState((s) => {
          const id = `m${Date.now()}`;
          return { ...s, members: [...s.members, { id, name, color: COLORS[s.members.length % COLORS.length] }] };
        }),
      removeMember: (id) =>
        setState((s) => ({
          ...s,
          members: s.members.filter((m) => m.id !== id),
          items: s.items.filter((i) => i.addedBy !== id),
          currentMemberId: s.currentMemberId === id ? s.members[0]?.id ?? "" : s.currentMemberId,
        })),
      setCurrentMember: (id) => setState((s) => ({ ...s, currentMemberId: id })),
      setCartName: (n) => setState((s) => ({ ...s, cartName: n })),
      clear: () => setState((s) => ({ ...s, items: [] })),
      totals: { subtotal, tax, total, perMember, byProduct },
    };
  }, [state]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useSharedCart() {
  const v = useContext(CartCtx);
  if (!v) throw new Error("useSharedCart outside provider");
  return v;
}
