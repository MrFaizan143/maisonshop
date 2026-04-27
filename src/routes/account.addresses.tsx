import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2, MapPin, Plus, Star, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/account/addresses")({
  head: () => ({ meta: [{ title: "Addresses — Maison" }] }),
  component: AddressesPage,
});

interface Address {
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

const blankForm = {
  full_name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};

function AddressesPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [list, setList] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(blankForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("updated_at", { ascending: false });
    setList((data ?? []) as Address[]);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    load().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("addresses").insert({
      user_id: user.id,
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      line1: form.line1.trim(),
      line2: form.line2.trim() || null,
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
      is_default: list.length === 0,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Address saved");
    setForm(blankForm);
    setShowForm(false);
    load();
  };

  const setDefault = async (id: string) => {
    if (!user) return;
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    toast.success("Default address updated");
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("addresses").delete().eq("id", id);
    toast.success("Address removed");
    load();
  };

  if (authLoading || loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Saved Addresses</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus className="mr-1 h-4 w-4" /> Add
          </Button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="mt-5 space-y-4 rounded-xl border border-border bg-card p-5 shadow-card"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">New address</h2>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setForm(blankForm);
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
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
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save address"}
          </Button>
        </form>
      )}

      {list.length === 0 && !showForm ? (
        <div className="mt-10 rounded-xl border border-dashed border-border p-10 text-center">
          <MapPin className="mx-auto h-8 w-8 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">
            No saved addresses yet. Add one to speed up future checkouts.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {list.map((a) => (
            <div
              key={a.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-card"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  {a.full_name}
                  {a.is_default && (
                    <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-mono uppercase text-accent">
                      default
                    </span>
                  )}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {a.line1}
                  {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pincode}
                </div>
                <div className="text-xs text-muted-foreground">{a.phone}</div>
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                {!a.is_default && (
                  <Button size="sm" variant="ghost" onClick={() => setDefault(a.id)}>
                    <Star className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => remove(a.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
