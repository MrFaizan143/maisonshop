export function formatINR(amount: number | string): string {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  if (Number.isNaN(n)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function discountPct(price: number, compareAt: number | null | undefined): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

/**
 * Calculates subtotal, shipping fee, and total for a list of cart items.
 * Shipping is free when subtotal is 0 or meets the free-shipping threshold.
 */
export function calcOrderTotals(
  items: Array<{ price: number; quantity: number }>,
  freeShippingThreshold: number,
  shippingFee = 49,
): { subtotal: number; shipping: number; total: number } {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal === 0 ? 0 : subtotal >= freeShippingThreshold ? 0 : shippingFee;
  const total = subtotal + shipping;
  return { subtotal, shipping, total };
}

/**
 * Returns a human-readable estimated delivery date string for `en-IN` locale.
 */
export function getEstimatedDelivery(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}
