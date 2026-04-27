import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { formatINR } from "@/lib/format";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "sonner";

export const Route = createFileRoute("/account/orders")({
  head: () => ({ meta: [{ title: "My Orders — Maison" }] }),
  component: OrdersPage,
});

interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  total: number;
  placed_at: string;
  order_items: {
    product_id: string | null;
    product_title: string;
    quantity: number;
    product_image: string | null;
    unit_price: number;
  }[];
}

function OrdersPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/login" });
      return;
    }
    if (!user) return;
    supabase
      .from("orders")
      .select(
        "id, order_number, status, total, placed_at, order_items(product_id, product_title, quantity, product_image, unit_price)",
      )
      .eq("user_id", user.id)
      .order("placed_at", { ascending: false })
      .then(({ data }) => {
        setOrders((data ?? []) as unknown as OrderRow[]);
        setLoading(false);
      });
  }, [user, authLoading, navigate]);

  if (loading || authLoading)
    return (
      <div className="py-20 text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
      </div>
    );

  const reorder = async (order: OrderRow) => {
    const ids = order.order_items.map((i) => i.product_id).filter((v): v is string => !!v);
    if (ids.length === 0) {
      toast.error("No reusable items found for this order");
      return;
    }
    const { data } = await supabase
      .from("products")
      .select("id, slug, stock")
      .in("id", ids)
      .eq("active", true);
    const stockMap = new Map((data ?? []).map((p) => [p.id, { slug: p.slug, stock: p.stock }]));
    let added = 0;
    for (const it of order.order_items) {
      if (!it.product_id) continue;
      const product = stockMap.get(it.product_id);
      if (!product || product.stock <= 0) continue;
      addItem(
        {
          productId: it.product_id,
          title: it.product_title,
          slug: product.slug,
          price: it.unit_price,
          image: it.product_image,
          stock: product.stock,
        },
        Math.min(it.quantity, product.stock),
      );
      added += 1;
    }
    if (added === 0) {
      toast.error("These items are currently unavailable");
      return;
    }
    toast.success(`Added ${added} item${added === 1 ? "" : "s"} to your cart`);
    navigate({ to: "/cart" });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-semibold">My Orders</h1>
      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-3 text-muted-foreground">No orders yet.</p>
          <Link to="/" className="mt-4 inline-block">
            <Button>Start shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-lg border border-border bg-card p-4 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-semibold">{o.order_number}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(o.placed_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent uppercase">
                    {o.status}
                  </span>
                  <span className="font-bold">{formatINR(o.total)}</span>
                  <Button size="sm" variant="outline" onClick={() => reorder(o)}>
                    Reorder
                  </Button>
                </div>
              </div>
              <div className="mt-3 text-sm text-muted-foreground">
                {o.order_items.map((it, i) => (
                  <div key={i}>
                    {it.quantity} × {it.product_title}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
