export type AnalyticsEventName =
  | "view_product"
  | "add_to_cart"
  | "begin_checkout"
  | "purchase"
  | "newsletter_subscribe";

const MAX_STORED_EVENTS = 200;

export function trackEvent(name: AnalyticsEventName, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const event = { name, payload, ts: new Date().toISOString() };
  try {
    const key = "maison-analytics-events";
    const prev = JSON.parse(localStorage.getItem(key) ?? "[]") as unknown[];
    localStorage.setItem(key, JSON.stringify([...prev.slice(-(MAX_STORED_EVENTS - 1)), event]));
  } catch {
    // ignore storage errors
  }

  const w = window as typeof window & { dataLayer?: unknown[] };
  if (Array.isArray(w.dataLayer)) w.dataLayer.push(event);
  if (import.meta.env.DEV) console.info("[analytics]", event);
}
