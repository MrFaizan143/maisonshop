import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Package, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/order/$id")({
  head: () => ({ meta: [{ title: "Order confirmed — ShopHub" }] }),
  component: OrderConfirmationPage,
});

interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  total: number;
  subtotal: number;
  shipping_fee: number;
  payment_method: string;
  ship_full_name: string;
  ship_phone: string;
  ship_line1: string;
  ship_line2: string | null;
  ship_city: string;
  ship_state: string;
  ship_pincode: string;
  placed_at: string;
}

interface OrderItemRow {
  id: string;
  product_title: string;
  product_image: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
}

function OrderConfirmationPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [items, setItems] = useState<OrderItemRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    Promise.all([
      supabase.from("orders").select("*").eq("id", id).maybeSingle(),
      supabase.from("order_items").select("*").eq("order_id", id),
    ]).then(([o, it]) => {
      setOrder((o.data as OrderRow) ?? null);
      setItems((it.data ?? []) as OrderItemRow[]);
      setLoading(false);
    });
  }, [id, user, authLoading, navigate]);

  if (loading || authLoading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <h1 className="text-xl font-semibold">Order not found</h1>
        <Link to="/account/orders" className="mt-4 inline-block text-primary underline">
          View your orders
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-3 py-6 sm:px-6 sm:py-10">
      <div className="rounded-xl border border-border bg-card p-6 shadow-card text-center sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold sm:text-3xl">Order placed!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Thank you, {order.ship_full_name.split(" ")[0]}. We've received your order and will
          contact you on <span className="font-medium text-foreground">{order.ship_phone}</span> to
          confirm.
        </p>
        <div className="mt-4 inline-block rounded-lg bg-muted px-4 py-2 font-mono text-sm font-semibold">
          {order.order_number}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <Wallet className="h-4 w-4" /> Payment
          </h2>
          <p className="mt-2 text-base font-semibold">Cash on Delivery</p>
          <p className="text-xs text-muted-foreground">Pay {formatINR(order.total)} when your order arrives.</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <Package className="h-4 w-4" /> Shipping to
          </h2>
          <p className="mt-2 text-sm font-medium">{order.ship_full_name}</p>
          <p className="text-xs text-muted-foreground">
            {order.ship_line1}{order.ship_line2 ? `, ${order.ship_line2}` : ""}, {order.ship_city},{" "}
            {order.ship_state} {order.ship_pincode}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-border bg-card p-5 shadow-card">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Items ({items.length})
        </h2>
        <div className="mt-3 divide-y divide-border">
          {items.map((it) => (
            <div key={it.id} className="flex items-center gap-3 py-3">
              {it.product_image ? (
                <img
                  src={it.product_image}
                  alt={it.product_title}
                  className="h-14 w-14 rounded-md object-cover"
                />
              ) : (
                <div className="h-14 w-14 rounded-md bg-muted" />
              )}
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-medium">{it.product_title}</p>
                <p className="text-xs text-muted-foreground">Qty {it.quantity}</p>
              </div>
              <span className="text-sm font-semibold">{formatINR(it.line_total)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatINR(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>{order.shipping_fee === 0 ? "FREE" : formatINR(order.shipping_fee)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
            <span>Total</span>
            <span>{formatINR(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to="/account/orders"
          className="inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          View all orders
        </Link>
        <Link
          to="/"
          className="inline-flex items-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold hover:bg-muted"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
