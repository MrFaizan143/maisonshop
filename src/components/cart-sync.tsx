import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { useCartStore, type CartItem } from "@/stores/cart-store";

// Bridges the local Zustand cart with Supabase `cart_items` for logged-in users.
// - On login: merge guest cart with server cart (sum quantities, capped by stock)
// - After merge: any local change is mirrored to the DB
// - On logout: stop syncing (local cart stays in localStorage)
export function CartSync() {
  const { user, loading } = useAuth();
  const lastSyncedUserId = useRef<string | null>(null);
  const hydrated = useRef(false);

  // INITIAL MERGE on user change ------------------------------------------------
  useEffect(() => {
    if (loading) return;

    // Logged out → reset bookkeeping
    if (!user) {
      lastSyncedUserId.current = null;
      hydrated.current = false;
      return;
    }

    // Already synced for this user
    if (lastSyncedUserId.current === user.id) return;
    lastSyncedUserId.current = user.id;
    hydrated.current = false;

    (async () => {
      const localItems = useCartStore.getState().items;
      const { data: serverRows } = await supabase
        .from("cart_items")
        .select("product_id, quantity, title, slug, price, image")
        .eq("user_id", user.id);

      const merged = new Map<string, CartItem>();
      // Seed from server
      for (const r of serverRows ?? []) {
        merged.set(r.product_id, {
          productId: r.product_id,
          title: r.title,
          slug: r.slug,
          price: Number(r.price),
          image: r.image,
          quantity: r.quantity,
          stock: 9999, // refreshed below
        });
      }
      // Merge local (sum quantities)
      for (const li of localItems) {
        const ex = merged.get(li.productId);
        if (ex) {
          merged.set(li.productId, { ...ex, quantity: ex.quantity + li.quantity, stock: li.stock });
        } else {
          merged.set(li.productId, li);
        }
      }

      // Refresh stock + price from products to avoid stale snapshots
      const ids = Array.from(merged.keys());
      if (ids.length > 0) {
        const { data: prods } = await supabase
          .from("products")
          .select("id, stock, price, active")
          .in("id", ids);
        for (const p of prods ?? []) {
          const ex = merged.get(p.id);
          if (!ex) continue;
          if (!p.active || p.stock <= 0) {
            merged.delete(p.id);
            continue;
          }
          merged.set(p.id, {
            ...ex,
            stock: p.stock,
            price: Number(p.price),
            quantity: Math.min(ex.quantity, p.stock),
          });
        }
      }

      const mergedList = Array.from(merged.values());
      useCartStore.setState({ items: mergedList });

      // Push merged state back to server (full replace is simplest & safe)
      if (mergedList.length > 0) {
        await supabase.from("cart_items").upsert(
          mergedList.map((i) => ({
            user_id: user.id,
            product_id: i.productId,
            quantity: i.quantity,
            title: i.title,
            slug: i.slug,
            price: i.price,
            image: i.image,
          })),
          { onConflict: "user_id,product_id" },
        );
      }
      // Remove server rows no longer present
      const localIds = new Set(mergedList.map((i) => i.productId));
      const toDelete = (serverRows ?? [])
        .filter((r) => !localIds.has(r.product_id))
        .map((r) => r.product_id);
      if (toDelete.length > 0) {
        await supabase
          .from("cart_items")
          .delete()
          .eq("user_id", user.id)
          .in("product_id", toDelete);
      }

      hydrated.current = true;
    })();
  }, [user, loading]);

  // ONGOING WRITE-THROUGH on cart changes -------------------------------------
  useEffect(() => {
    if (!user) return;
    let prev = useCartStore.getState().items;
    const unsub = useCartStore.subscribe((state) => {
      if (!hydrated.current) {
        prev = state.items;
        return;
      }
      const next = state.items;
      void diffAndPersist(user.id, prev, next);
      prev = next;
    });
    return unsub;
  }, [user]);

  return null;
}

async function diffAndPersist(userId: string, prev: CartItem[], next: CartItem[]) {
  const prevMap = new Map(prev.map((i) => [i.productId, i]));
  const nextMap = new Map(next.map((i) => [i.productId, i]));

  const upserts: CartItem[] = [];
  for (const [id, item] of nextMap) {
    const p = prevMap.get(id);
    if (!p || p.quantity !== item.quantity || p.price !== item.price) {
      upserts.push(item);
    }
  }
  const removed: string[] = [];
  for (const id of prevMap.keys()) {
    if (!nextMap.has(id)) removed.push(id);
  }

  if (upserts.length > 0) {
    await supabase.from("cart_items").upsert(
      upserts.map((i) => ({
        user_id: userId,
        product_id: i.productId,
        quantity: i.quantity,
        title: i.title,
        slug: i.slug,
        price: i.price,
        image: i.image,
      })),
      { onConflict: "user_id,product_id" },
    );
  }
  if (removed.length > 0) {
    await supabase.from("cart_items").delete().eq("user_id", userId).in("product_id", removed);
  }
}
