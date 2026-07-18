import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSharedCart } from "@/lib/shared-cart";

export const Route = createFileRoute("/join/$code")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Join a shared cart — ShopEZ" },
      { name: "description", content: "You've been invited to a shared ShopEZ cart. Join and start adding items." },
    ],
  }),
  component: JoinPage,
});

function JoinPage() {
  const { code } = Route.useParams();
  const navigate = useNavigate();
  const { join } = useSharedCart();
  const [status, setStatus] = useState<"checking" | "joining" | "error" | "auth">("checking");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) { setStatus("auth"); return; }
      setStatus("joining");
      try {
        const r = await join.mutateAsync(code);
        toast.success("Joined the shared cart");
        navigate({ to: "/cart" });
        void r;
      } catch (e: any) {
        setStatus("error");
        setMsg(e.message ?? "Could not join");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-12">
      <div className="max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Invite</div>
        <h1 className="mt-2 font-display text-3xl">Joining cart {code}</h1>
        {status === "checking" && <p className="mt-3 text-sm text-muted-foreground">Checking your session…</p>}
        {status === "joining" && <p className="mt-3 text-sm text-muted-foreground">Adding you to the cart…</p>}
        {status === "auth" && (
          <>
            <p className="mt-3 text-sm text-muted-foreground">Sign in first, then we'll drop you into the cart.</p>
            <Link to="/auth" className="mt-5 inline-block rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground">Sign in</Link>
          </>
        )}
        {status === "error" && (
          <>
            <p className="mt-3 text-sm text-destructive">{msg}</p>
            <Link to="/" className="mt-5 inline-block text-sm text-brand hover:underline">Back home</Link>
          </>
        )}
      </div>
    </div>
  );
}
