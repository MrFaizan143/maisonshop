import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Search, ShoppingBag, User, Menu, X, Package, LogOut, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCartStore } from "@/stores/cart-store";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

const CATEGORY_LINKS = [
  { slug: "fashion", label: "Fashion" },
  { slug: "grocery", label: "Food" },
  { slug: "electronics", label: "Electronics" },
  { slug: "home", label: "Home" },
  { slug: "beauty", label: "Beauty" },
];
const QUICK_SEARCH_TERMS = ["Summer dress", "Skin care", "Coffee", "Wireless earbuds"];

export function SiteHeader() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const { user, isAdmin, signOut } = useAuth();
  const [q, setQ] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [path]);

  useEffect(() => {
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = q.trim().slice(0, 100);
    navigate({ to: "/search", search: { q: trimmed } });
    setMobileOpen(false);
    setSearchOpen(false);
    setQ("");
  };

  return (
    <header className="sticky top-0 z-40 w-full anchor-mono bg-[oklch(0.08_0_0)] text-[oklch(0.99_0_0)] border-b border-[oklch(0.18_0_0)]">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-5 sm:px-8">
        {/* Brand — typographic mark */}
        <Link to="/" className="flex items-baseline gap-1 shrink-0">
          <span className="font-editorial text-2xl tracking-tight">Maison</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
            — shop
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-7">
          {CATEGORY_LINKS.map((c) => {
            const active = path === `/category/${c.slug}`;
            return (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className={cn(
                  "text-[13px] uppercase tracking-[0.18em] font-medium transition-colors",
                  active ? "text-white" : "text-white/55 hover:text-white",
                )}
              >
                {c.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: search + account + cart */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSearchOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10 transition"
            aria-label="Search"
            aria-expanded={searchOpen}
            aria-controls="site-search-panel"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10 transition"
                  aria-label="Account"
                >
                  <User className="h-[18px] w-[18px]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-[oklch(0.08_0_0)] text-white border-[oklch(0.18_0_0)]"
              >
                <DropdownMenuLabel className="truncate text-white/70 text-xs uppercase tracking-wider">
                  {user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[oklch(0.18_0_0)]" />
                <DropdownMenuItem
                  onClick={() => navigate({ to: "/account/orders" })}
                  className="focus:bg-white/10 focus:text-white"
                >
                  <Package className="mr-2 h-4 w-4" /> Orders
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate({ to: "/account/addresses" })}
                  className="focus:bg-white/10 focus:text-white"
                >
                  <User className="mr-2 h-4 w-4" /> Addresses
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator className="bg-[oklch(0.18_0_0)]" />
                    <DropdownMenuItem
                      onClick={() => navigate({ to: "/admin" })}
                      className="focus:bg-white/10 focus:text-white"
                    >
                      <Shield className="mr-2 h-4 w-4" /> Admin
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator className="bg-[oklch(0.18_0_0)]" />
                <DropdownMenuItem
                  onClick={() => signOut().then(() => navigate({ to: "/" }))}
                  className="focus:bg-white/10 focus:text-white"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/login"
              className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10 transition"
              aria-label="Sign in"
            >
              <User className="h-[18px] w-[18px]" />
            </Link>
          )}

          <Link
            to="/cart"
            className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-white/10 transition"
            aria-label={`Cart${totalCount > 0 ? ` (${totalCount} items)` : ""}`}
          >
            <ShoppingBag className="h-[18px] w-[18px]" />
            {totalCount > 0 && (
              <span className="absolute top-1 right-1 grid h-4 min-w-4 place-items-center rounded-full bg-white px-1 text-[10px] font-semibold text-black">
                {totalCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => {
              setMobileOpen((v) => !v);
              setSearchOpen(false);
            }}
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10 transition lg:hidden"
            aria-label="Menu"
            aria-expanded={mobileOpen}
            aria-controls="site-mobile-menu"
          >
            {mobileOpen ? (
              <X className="h-[18px] w-[18px]" />
            ) : (
              <Menu className="h-[18px] w-[18px]" />
            )}
          </button>
        </div>
      </div>

      {/* Search expander */}
      {searchOpen && (
        <div
          id="site-search-panel"
          className="border-t border-[oklch(0.18_0_0)] bg-[oklch(0.08_0_0)] animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <form
            onSubmit={onSearch}
            className="mx-auto flex max-w-[1400px] items-center gap-3 px-5 py-4 sm:px-8"
          >
            <Search className="h-4 w-4 text-white/50" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products, brands, categories…"
              aria-label="Search products"
              className="flex-1 bg-transparent text-white placeholder:text-white/40 outline-none text-base"
            />
            <button
              type="submit"
              className="rounded-md border border-white/25 px-3 py-1 text-xs uppercase tracking-wider text-white/80 hover:border-white/50 hover:text-white"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="text-xs uppercase tracking-wider text-white/60 hover:text-white"
            >
              Close
            </button>
          </form>
          <div className="mx-auto flex max-w-[1400px] flex-wrap gap-2 px-5 pb-4 sm:px-8">
            {QUICK_SEARCH_TERMS.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  navigate({ to: "/search", search: { q: term } });
                  setSearchOpen(false);
                  setQ("");
                }}
                className="rounded-full border border-white/20 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/80 hover:border-white/45 hover:text-white"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          id="site-mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="border-t border-[oklch(0.18_0_0)] bg-[oklch(0.08_0_0)] lg:hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <nav className="mx-auto flex max-w-[1400px] flex-col px-5 py-4">
            {CATEGORY_LINKS.map((c) => (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                onClick={() => setMobileOpen(false)}
                className="border-b border-[oklch(0.18_0_0)] py-4 font-editorial text-2xl"
              >
                {c.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
