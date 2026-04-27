export interface RecentlyViewedItem {
  id: string;
  slug: string;
  title: string;
  price: number;
  image_url: string | null;
  compare_at_price: number | null;
  rating: number | null;
  rating_count: number;
  stock: number;
  viewedAt: string;
}

const KEY = "maison-recently-viewed";
const LIMIT = 12;

export function pushRecentlyViewed(
  input: Omit<RecentlyViewedItem, "viewedAt"> | null | undefined,
) {
  if (typeof window === "undefined" || !input) return;
  try {
    const prev = getRecentlyViewed();
    const next: RecentlyViewedItem = { ...input, viewedAt: new Date().toISOString() };
    const merged = [next, ...prev.filter((p) => p.id !== next.id)].slice(0, LIMIT);
    localStorage.setItem(KEY, JSON.stringify(merged));
  } catch {
    // ignore storage errors
  }
}

export function getRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentlyViewedItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v) => !!v?.id && !!v?.slug && !!v?.title);
  } catch {
    return [];
  }
}
