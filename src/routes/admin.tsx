import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Package, ShoppingBag, LayoutGrid } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — ShopHub" }] }),
  component: AdminPage,
});

interface AdminOrder {
  id: string;
  order_number: string;
  status: string;
  total: number;
  ship_full_name: string;
  ship_phone: string;
  ship_city: string;
  placed_at: string;
}

function AdminPage() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [counts, setCounts] = useState({ products: 0, categories: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate({ to: "/login" }); return; }
    if (!isAdmin) { setLoading(false); return; }
    Promise.all([
      supabase.from("orders").select("id, order_number, status, total, ship_full_name, ship_phone, ship_city, placed_at").order("placed_at", { ascending: false }).limit(50),
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("categories").select("id", { count: "exact", head: true }),
    ]).then(([o, p, c]) => {
      setOrders((o.data ?? []) as AdminOrder[]);
      setCounts({ products: p.count ?? 0, categories: c.count ?? 0 });
      setLoading(false);
    });
  }, [user, isAdmin, authLoading, navigate]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status: status as never }).eq("id", id);
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
  };

  if (authLoading || loading) return <div className="py-20 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>;
  if (!isAdmin) return (
    <div className="mx-auto max-w-md py-20 text-center">
      <h1 className="text-xl font-semibold">Access denied</h1>
      <p className="mt-2 text-sm text-muted-foreground">You don't have admin access. Ask the site owner to grant you the admin role.</p>
      <Link to="/" className="mt-4 inline-block text-primary underline">Back home</Link>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-semibold">Admin Panel</h1>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4 shadow-card flex items-center gap-3">
          <ShoppingBag className="h-8 w-8 text-accent" />
          <div><div className="text-2xl font-bold">{orders.length}</div><div className="text-xs text-muted-foreground">Recent orders</div></div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-card flex items-center gap-3">
          <Package className="h-8 w-8 text-accent" />
          <div><div className="text-2xl font-bold">{counts.products}</div><div className="text-xs text-muted-foreground">Products</div></div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-card flex items-center gap-3">
          <LayoutGrid className="h-8 w-8 text-accent" />
          <div><div className="text-2xl font-bold">{counts.categories}</div><div className="text-xs text-muted-foreground">Categories</div></div>
        </div>
      </div>

      <h2 className="mb-3 text-lg font-semibold">Recent Orders</h2>
      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-xs uppercase">
            <tr>
              <th className="p-3 text-left">Order</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No orders yet</td></tr>
            ) : orders.map((o) => (
              <tr key={o.id} className="border-t border-border">
                <td className="p-3 font-mono text-xs">{o.order_number}</td>
                <td className="p-3">{o.ship_full_name}<div className="text-xs text-muted-foreground">{o.ship_phone} · {o.ship_city}</div></td>
                <td className="p-3 font-semibold">{formatINR(o.total)}</td>
                <td className="p-3">
                  <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} className="rounded-md border border-border bg-background px-2 py-1 text-xs">
                    <option value="pending">pending</option>
                    <option value="confirmed">confirmed</option>
                    <option value="shipped">shipped</option>
                    <option value="delivered">delivered</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </td>
                <td className="p-3 text-xs text-muted-foreground">{new Date(o.placed_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/admin/products" className="inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          Manage products
        </Link>
        <Link to="/admin/products/new" className="inline-flex items-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold hover:bg-muted">
          Add new product
        </Link>
      </div>
    </div>
  );
}
