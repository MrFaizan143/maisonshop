import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { useCartStore } from "@/stores/cart-store";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Maison" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal === 0 ? 0 : subtotal >= 499 ? 0 : 49;
  const total = subtotal + shipping;

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login" });
    if (!authLoading && items.length === 0) navigate({ to: "/cart" });
  }, [user, authLoading, items.length, navigate]);

  const handlePlace = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setPlacing(true);
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        subtotal,
        shipping_fee: shipping,
        total,
        payment_method: "cod",
        ship_full_name: form.full_name,
        ship_phone: form.phone,
        ship_line1: form.line1,
        ship_line2: form.line2 || null,
        ship_city: form.city,
        ship_state: form.state,
        ship_pincode: form.pincode,
      })
      .select("id, order_number")
      .single();
    if (error || !order) {
      toast.error("Couldn't place order", { description: error?.message });
      setPlacing(false);
      return;
    }
    const { error: itemsErr } = await supabase.from("order_items").insert(
      items.map((i) => ({
        order_id: order.id,
        product_id: i.productId,
        product_title: i.title,
        product_image: i.image,
        unit_price: i.price,
        quantity: i.quantity,
        line_total: i.price * i.quantity,
      })),
    );
    if (itemsErr) {
      toast.error("Order items failed", { description: itemsErr.message });
      setPlacing(false);
      return;
    }
    clearCart();
    toast.success(`Order ${order.order_number} placed!`);
    navigate({ to: "/order/$id", params: { id: order.id } });
  };

  if (authLoading || !user || items.length === 0) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
      <h1 className="mb-4 text-2xl font-semibold">Checkout</h1>
      <form onSubmit={handlePlace} className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5 rounded-xl border border-border bg-card p-5 shadow-card">
          <h2 className="text-lg font-semibold">Shipping address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Full name</Label>
              <Input
                required
                maxLength={100}
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                required
                maxLength={20}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Address line 1</Label>
              <Input
                required
                maxLength={200}
                value={form.line1}
                onChange={(e) => setForm({ ...form, line1: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Address line 2 (optional)</Label>
              <Input
                maxLength={200}
                value={form.line2}
                onChange={(e) => setForm({ ...form, line2: e.target.value })}
              />
            </div>
            <div>
              <Label>City</Label>
              <Input
                required
                maxLength={100}
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div>
              <Label>State</Label>
              <Input
                required
                maxLength={100}
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </div>
            <div>
              <Label>Pincode</Label>
              <Input
                required
                maxLength={12}
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold">Payment method</h2>
            <div className="mt-2 flex items-center gap-3 rounded-lg border-2 border-accent bg-accent/10 p-4">
              <Wallet className="h-5 w-5 text-accent" />
              <div>
                <div className="font-semibold">Cash on Delivery</div>
                <div className="text-xs text-muted-foreground">Pay when your order arrives</div>
              </div>
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-xl border border-border bg-card p-5 shadow-card lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">Order Summary</h2>
          <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
            {items.map((i) => (
              <div key={i.productId} className="flex justify-between text-xs">
                <span className="line-clamp-1 mr-2">
                  {i.title} × {i.quantity}
                </span>
                <span className="font-medium shrink-0">{formatINR(i.price * i.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shipping === 0 ? "FREE" : formatINR(shipping)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
              <span>Total</span>
              <span>{formatINR(total)}</span>
            </div>
          </div>
          <Button
            type="submit"
            disabled={placing}
            size="lg"
            className="mt-5 w-full bg-deal text-white hover:bg-deal/90 font-semibold"
          >
            {placing ? <Loader2 className="h-4 w-4 animate-spin" /> : `Place Order (COD)`}
          </Button>
          <Link
            to="/cart"
            className="mt-3 block text-center text-xs text-muted-foreground hover:text-foreground"
          >
            Back to cart
          </Link>
        </aside>
      </form>
    </div>
  );
}
