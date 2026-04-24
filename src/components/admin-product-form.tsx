import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
}

interface ProductFormState {
  title: string;
  slug: string;
  description: string;
  price: string;
  compare_at_price: string;
  stock: string;
  category_id: string;
  brand: string;
  image_url: string;
  active: boolean;
  featured: boolean;
}

const empty: ProductFormState = {
  title: "",
  slug: "",
  description: "",
  price: "",
  compare_at_price: "",
  stock: "0",
  category_id: "",
  brand: "",
  image_url: "",
  active: true,
  featured: false,
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export function AdminProductForm({ productId }: { productId?: string }) {
  const navigate = useNavigate();
  const [form, setForm] = useState<ProductFormState>(empty);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from("categories").select("id, name").order("sort_order"),
      productId
        ? supabase.from("products").select("*").eq("id", productId).maybeSingle()
        : Promise.resolve({ data: null }),
    ]).then(([cats, prod]) => {
      setCategories((cats.data ?? []) as Category[]);
      if (prod.data) {
        const p = prod.data as Record<string, unknown>;
        setForm({
          title: String(p.title ?? ""),
          slug: String(p.slug ?? ""),
          description: String(p.description ?? ""),
          price: String(p.price ?? ""),
          compare_at_price: p.compare_at_price ? String(p.compare_at_price) : "",
          stock: String(p.stock ?? 0),
          category_id: p.category_id ? String(p.category_id) : "",
          brand: String(p.brand ?? ""),
          image_url: String(p.image_url ?? ""),
          active: Boolean(p.active),
          featured: Boolean(p.featured),
        });
      }
      setLoading(false);
    });
  }, [productId]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) {
      toast.error("Upload failed", { description: error.message });
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setForm((f) => ({ ...f, image_url: data.publicUrl }));
    setUploading(false);
    toast.success("Image uploaded");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const slug = form.slug.trim() || slugify(form.title);
    const payload = {
      title: form.title.trim(),
      slug,
      description: form.description,
      price: Number(form.price),
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      stock: Number(form.stock) || 0,
      category_id: form.category_id || null,
      brand: form.brand.trim() || null,
      image_url: form.image_url || null,
      active: form.active,
      featured: form.featured,
    };
    const { error } = productId
      ? await supabase.from("products").update(payload).eq("id", productId)
      : await supabase.from("products").insert(payload);
    setSaving(false);
    if (error) {
      toast.error("Save failed", { description: error.message });
      return;
    }
    toast.success(productId ? "Product updated" : "Product created");
    navigate({ to: "/admin/products" });
  };

  if (loading)
    return (
      <div className="py-20 text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
      </div>
    );

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl px-4 py-6 space-y-5">
      <h1 className="text-2xl font-semibold">{productId ? "Edit product" : "New product"}</h1>

      <div className="rounded-xl border border-border bg-card p-5 shadow-card space-y-4">
        <div>
          <Label>Title</Label>
          <Input
            required
            maxLength={200}
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
                slug: form.slug || slugify(e.target.value),
              })
            }
          />
        </div>
        <div>
          <Label>Slug (URL)</Label>
          <Input
            required
            maxLength={120}
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
          />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>Price (₹)</Label>
            <Input
              type="number"
              required
              min="0"
              step="1"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div>
            <Label>Compare-at price (₹)</Label>
            <Input
              type="number"
              min="0"
              step="1"
              value={form.compare_at_price}
              onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })}
            />
          </div>
          <div>
            <Label>Stock</Label>
            <Input
              type="number"
              required
              min="0"
              step="1"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Category</Label>
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">— None —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Brand</Label>
            <Input
              maxLength={100}
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-card space-y-3">
        <Label>Product image</Label>
        {form.image_url && (
          <div className="relative inline-block">
            <img
              src={form.image_url}
              alt="Product"
              className="h-32 w-32 rounded-md object-cover border border-border"
            />
            <button
              type="button"
              onClick={() => setForm({ ...form, image_url: "" })}
              className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 cursor-pointer rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-muted">
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span>{uploading ? "Uploading…" : "Upload image"}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f);
                e.target.value = "";
              }}
            />
          </label>
          <Input
            placeholder="…or paste image URL"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            className="max-w-md"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-card grid gap-4 sm:grid-cols-2">
        <div className="flex items-center justify-between">
          <div>
            <Label>Active</Label>
            <p className="text-xs text-muted-foreground">Visible to shoppers</p>
          </div>
          <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>Featured</Label>
            <p className="text-xs text-muted-foreground">Show in featured deals</p>
          </div>
          <Switch
            checked={form.featured}
            onCheckedChange={(v) => setForm({ ...form, featured: v })}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={saving}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : productId ? (
            "Save changes"
          ) : (
            "Create product"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate({ to: "/admin/products" })}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
