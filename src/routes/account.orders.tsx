import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/account/orders")({
  head: () => ({ meta: [{ title: "My Orders — ShopHub" }] }),
  component: OrdersPage,
});

interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  total: number;
  placed_at: string;
  order_items: { product_title: string; quantity: number; product_image: string | null }[];
}

function OrdersPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/login" });
      return;
    }
    if (!user) return;
    supabase
      .from("orders")
      .select("id, order_number, status, total, placed_at, order_items(product_title, quantity, product_image)")
      .eq("user_id", user.id)
      .order("placed_at", { ascending: false })
      .then(({ data }) => {
        setOrders((data ?? []) as unknown as OrderRow[]);
        setLoading(false);
      });
  }, [user, authLoading, navigate]);

  if (loading || authLoading) return <div className="py-20 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-semibold">My Orders</h1>
      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-3 text-muted-foreground">No orders yet.</p>
          <Link to="/" className="mt-4 inline-block"><Button>Start shopping</Button></Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-lg border border-border bg-card p-4 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-semibold">{o.order_number}</div>
                  <div className="text-xs text-muted-foreground">{new Date(o.placed_at).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent uppercase">{o.status}</span>
                  <span className="font-bold">{formatINR(o.total)}</span>
                </div>
              </div>
              <div className="mt-3 text-sm text-muted-foreground">
                {o.order_items.map((it, i) => (
                  <div key={i}>{it.quantity} × {it.product_title}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
