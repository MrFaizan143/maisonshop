import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Pencil, Eye, EyeOff, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products")({
  head: () => ({ meta: [{ title: "Admin Products — Maison" }] }),
  component: AdminProductsPage,
});

interface Row {
  id: string;
  title: string;
  slug: string;
  price: number;
  stock: number;
  active: boolean;
  featured: boolean;
  image_url: string | null;
  category_id: string | null;
}

function AdminProductsPage() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "disabled">("all");

  const load = async () => {
    const { data } = await supabase
      .from("products")
      .select("id, title, slug, price, stock, active, featured, image_url, category_id")
      .order("created_at", { ascending: false });
    setRows((data ?? []) as Row[]);
  };

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
    load().finally(() => setLoading(false));
  }, [user, isAdmin, authLoading, navigate]);

  const toggleActive = async (id: string, active: boolean) => {
    const { error } = await supabase.from("products").update({ active: !active }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, active: !active } : r)));
    toast.success(!active ? "Product enabled" : "Product disabled");
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter === "active" && !r.active) return false;
      if (statusFilter === "disabled" && r.active) return false;
      if (!q) return true;
      return r.title.toLowerCase().includes(q) || r.slug.toLowerCase().includes(q);
    });
  }, [rows, search, statusFilter]);

  if (authLoading || loading)
    return (
      <div className="py-20 text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
      </div>
    );
  if (!isAdmin)
    return <div className="py-20 text-center text-sm text-muted-foreground">Admins only.</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <Link to="/admin" className="text-xs text-muted-foreground hover:text-foreground">
            ← Admin home
          </Link>
        </div>
        <Link to="/admin/products/new">
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="mr-1 h-4 w-4" /> New product
          </Button>
        </Link>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search title or slug…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-7 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "disabled")}
          className="h-9 rounded-md border border-border bg-background px-2 text-sm"
        >
          <option value="all">All ({rows.length})</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-xs uppercase">
            <tr>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Stock</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  No products match
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {r.image_url ? (
                        <img src={r.image_url} alt="" className="h-10 w-10 rounded object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted" />
                      )}
                      <div className="min-w-0">
                        <div className="line-clamp-1 font-medium">{r.title}</div>
                        <div className="text-xs text-muted-foreground font-mono">{r.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-semibold">{formatINR(r.price)}</td>
                  <td className="p-3">{r.stock}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${r.active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}
                    >
                      {r.active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleActive(r.id, r.active)}
                        title={r.active ? "Disable" : "Enable"}
                      >
                        {r.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Link to="/admin/products/$id" params={{ id: r.id }}>
                        <Button size="sm" variant="ghost">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
