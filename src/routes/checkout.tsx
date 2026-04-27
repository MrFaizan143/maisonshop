import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Wallet, MapPin, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { useCartStore } from "@/stores/cart-store";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Maison" }] }),
  component: CheckoutPage,
});

interface SavedAddress {
  id: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

const PIN_RE = /^\d{6}$/;
const PHONE_RE = /^[6-9]\d{9}$/;

function CheckoutPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal === 0 ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 49;
  const total = subtotal + shipping;

  const [saved, setSaved] = useState<SavedAddress[]>([]);
  const [selectedId, setSelectedId] = useState<string | "new">("new");
  const [saveForLater, setSaveForLater] = useState(true);
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

  // Load saved addresses
  useEffect(() => {
    if (!user) return;
    supabase
      .from("addresses")
      .select("id, full_name, phone, line1, line2, city, state, pincode, is_default")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("updated_at", { ascending: false })
      .then(({ data }) => {
        const list = (data ?? []) as SavedAddress[];
        setSaved(list);
        if (list.length > 0) {
          const def = list.find((a) => a.is_default) ?? list[0];
          setSelectedId(def.id);
          setForm({
            full_name: def.full_name,
            phone: def.phone,
            line1: def.line1,
            line2: def.line2 ?? "",
            city: def.city,
            state: def.state,
            pincode: def.pincode,
          });
          setSaveForLater(false);
        }
      });
  }, [user]);

  const pickAddress = (id: string) => {
    setSelectedId(id);
    if (id === "new") {
      setForm({
        full_name: "",
        phone: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        pincode: "",
      });
      setSaveForLater(true);
      return;
    }
    const a = saved.find((x) => x.id === id);
    if (!a) return;
    setForm({
      full_name: a.full_name,
      phone: a.phone,
      line1: a.line1,
      line2: a.line2 ?? "",
      city: a.city,
      state: a.state,
      pincode: a.pincode,
    });
    setSaveForLater(false);
  };

  const validate = (): string | null => {
    if (form.full_name.trim().length < 2) return "Please enter your full name";
    if (!PHONE_RE.test(form.phone.trim())) return "Enter a valid 10-digit Indian mobile number";
    if (form.line1.trim().length < 5) return "Address line 1 looks too short";
    if (form.city.trim().length < 2) return "Please enter your city";
    if (form.state.trim().length < 2) return "Please enter your state";
    if (!PIN_RE.test(form.pincode.trim())) return "Pincode must be 6 digits";
    return null;
  };

  const handlePlace = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    setPlacing(true);
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        subtotal,
        shipping_fee: shipping,
        total,
        payment_method: "cod",
        ship_full_name: form.full_name.trim(),
        ship_phone: form.phone.trim(),
        ship_line1: form.line1.trim(),
        ship_line2: form.line2.trim() || null,
        ship_city: form.city.trim(),
        ship_state: form.state.trim(),
        ship_pincode: form.pincode.trim(),
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
      const { error: rollbackError } = await supabase.from("orders").delete().eq("id", order.id);
      if (rollbackError) {
        console.error("Failed to rollback orphaned order", rollbackError);
        toast.error("We could not fully rollback a failed order. Please contact support.");
      }
      toast.error("Order items failed", { description: itemsErr.message });
      setPlacing(false);
      return;
    }
    // Save address for future use (best-effort)
    if (selectedId === "new" && saveForLater) {
      await supabase.from("addresses").insert({
        user_id: user.id,
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        line1: form.line1.trim(),
        line2: form.line2.trim() || null,
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        is_default: saved.length === 0,
      });
    }
    clearCart();
    trackEvent("purchase", {
      orderId: order.id,
      orderNumber: order.order_number,
      total,
      itemCount: items.length,
      paymentMethod: "cod",
    });
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
    <div className="mx-auto max-w-7xl px-3 py-4 pb-28 sm:px-6 sm:py-6 lg:pb-6">
      <h1 className="mb-4 text-2xl font-semibold">Checkout</h1>
      <form onSubmit={handlePlace} className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5 rounded-xl border border-border bg-card p-5 shadow-card">
          {saved.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Saved addresses
              </h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {saved.map((a) => (
                  <button
                    type="button"
                    key={a.id}
                    onClick={() => pickAddress(a.id)}
                    className={cn(
                      "relative flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors",
                      selectedId === a.id
                        ? "border-accent bg-accent/5"
                        : "border-border hover:bg-muted/50",
                    )}
                  >
                    {selectedId === a.id && (
                      <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-accent text-accent-foreground">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                    <div className="flex items-center gap-1.5 text-sm font-semibold">
                      <MapPin className="h-3.5 w-3.5 text-accent" />
                      {a.full_name}
                      {a.is_default && (
                        <span className="ml-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono uppercase">
                          default
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {a.line1}
                      {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pincode}
                    </div>
                    <div className="text-xs text-muted-foreground">{a.phone}</div>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => pickAddress("new")}
                  className={cn(
                    "flex items-center justify-center rounded-lg border border-dashed p-3 text-sm font-medium transition-colors",
                    selectedId === "new"
                      ? "border-accent bg-accent/5 text-accent"
                      : "border-border text-muted-foreground hover:bg-muted/50",
                  )}
                >
                  + Use a new address
                </button>
              </div>
            </div>
          )}

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
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })
                }
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
                inputMode="numeric"
                maxLength={6}
                value={form.pincode}
                onChange={(e) =>
                  setForm({ ...form, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })
                }
              />
            </div>
          </div>

          {selectedId === "new" && (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={saveForLater}
                onCheckedChange={(v) => setSaveForLater(v === true)}
              />
              Save this address for future orders
            </label>
          )}

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

        <aside className="hidden h-fit rounded-xl border border-border bg-card p-5 shadow-card lg:sticky lg:top-24 lg:block">
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

        {/* Sticky mobile bar */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 p-3 shadow-lg backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Total
              </div>
              <div className="text-lg font-bold">{formatINR(total)}</div>
            </div>
            <Button
              type="submit"
              disabled={placing}
              size="lg"
              className="flex-1 bg-deal text-white hover:bg-deal/90 font-semibold"
            >
              {placing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Place Order (COD)"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
