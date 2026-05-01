import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Package, ShoppingBag, LayoutGrid, IndianRupee, Search, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { formatINR } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Maison" }] }),
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

const STATUS_FILTERS = [
  "all",
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
] as const;

function AdminPage() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [counts, setCounts] = useState({ products: 0, categories: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>("all");
  const [search, setSearch] = useState("");
  const [newOrderCount, setNewOrderCount] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    Promise.all([
      supabase
        .from("orders")
        .select("id, order_number, status, total, ship_full_name, ship_phone, ship_city, placed_at")
        .order("placed_at", { ascending: false })
        .limit(100),
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("categories").select("id", { count: "exact", head: true }),
    ]).then(([o, p, c]) => {
      setOrders((o.data ?? []) as AdminOrder[]);
      setCounts({ products: p.count ?? 0, categories: c.count ?? 0 });
      setLoading(false);
    });
  }, [user, isAdmin, authLoading, navigate]);

  // Realtime: live updates for new orders + status changes
  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase
      .channel("admin-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const o = payload.new as AdminOrder;
          setOrders((prev) => [o, ...prev].slice(0, 100));
          setNewOrderCount((n) => n + 1);
          toast.success(`New order ${o.order_number}`, {
            description: `${o.ship_full_name} · ${formatINR(Number(o.total))}`,
          });
          // Soft chime via Web Audio (no asset required)
          try {
            const ctx = new (window.AudioContext ||
              (window as unknown as { webkitAudioContext: typeof AudioContext })
                .webkitAudioContext)();
            const o1 = ctx.createOscillator();
            const g = ctx.createGain();
            o1.frequency.value = 880;
            o1.connect(g);
            g.connect(ctx.destination);
            g.gain.setValueAtTime(0.0001, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
            o1.start();
            o1.stop(ctx.currentTime + 0.4);
          } catch {
            /* no-op */
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          const u = payload.new as AdminOrder;
          setOrders((prev) => prev.map((o) => (o.id === u.id ? { ...o, ...u } : o)));
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  const updateStatus = async (id: string, status: string) => {
    const prev = orders;
    setOrders((p) => p.map((o) => (o.id === id ? { ...o, status } : o)));
    const { error } = await supabase
      .from("orders")
      .update({ status: status as never })
      .eq("id", id);
    if (error) setOrders(prev);
  };

  const revenue = useMemo(
    () => orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + Number(o.total), 0),
    [orders],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (!q) return true;
      return (
        o.order_number.toLowerCase().includes(q) ||
        o.ship_full_name.toLowerCase().includes(q) ||
        o.ship_phone.includes(q) ||
        o.ship_city.toLowerCase().includes(q)
      );
    });
  }, [orders, statusFilter, search]);

  if (authLoading || loading)
    return (
      <div className="py-20 text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
      </div>
    );
  if (!isAdmin)
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <h1 className="text-xl font-semibold">Access denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You don't have admin access. Ask the site owner to grant you the admin role.
        </p>
        <Link to="/" className="mt-4 inline-block text-primary underline">
          Back home
        </Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-semibold">Admin Panel</h1>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ShoppingBag} label="Recent orders" value={orders.length.toString()} />
        <StatCard icon={IndianRupee} label="Orders revenue (last 100)" value={formatINR(revenue)} />
        <StatCard icon={Package} label="Products" value={counts.products.toString()} />
        <StatCard icon={LayoutGrid} label="Categories" value={counts.categories.toString()} />
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold">Recent Orders</h2>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search orders…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-48 pl-7 text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as (typeof STATUS_FILTERS)[number])}
            className="h-9 rounded-md border border-border bg-background px-2 text-sm"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All statuses" : s}
              </option>
            ))}
          </select>
        </div>
      </div>

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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  No orders match
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr key={o.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-3 font-mono text-xs">
                    <Link to="/order/$id" params={{ id: o.id }} className="hover:underline">
                      {o.order_number}
                    </Link>
                  </td>
                  <td className="p-3">
                    {o.ship_full_name}
                    <div className="text-xs text-muted-foreground">
                      {o.ship_phone} · {o.ship_city}
                    </div>
                  </td>
                  <td className="p-3 font-semibold">{formatINR(o.total)}</td>
                  <td className="p-3">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                    >
                      <option value="pending">pending</option>
                      <option value="confirmed">confirmed</option>
                      <option value="shipped">shipped</option>
                      <option value="delivered">delivered</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {new Date(o.placed_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to="/admin/products"
          className="inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Manage products
        </Link>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold hover:bg-muted"
        >
          Add new product
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Package;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-card flex items-center gap-3">
      <Icon className="h-8 w-8 text-accent" />
      <div className="min-w-0">
        <div className="truncate text-xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
