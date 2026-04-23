import { useState, type FormEvent } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Search, ShoppingCart, User, Menu, X, Package, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/stores/cart-store";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

const CATEGORY_LINKS = [
  { slug: "electronics", label: "Electronics" },
  { slug: "fashion", label: "Fashion" },
  { slug: "home", label: "Home" },
  { slug: "beauty", label: "Beauty" },
  { slug: "grocery", label: "Grocery" },
];

export function SiteHeader() {
  const navigate = useNavigate();
  const totalCount = useCartStore((s) => s.totalCount());
  const { user, isAdmin, signOut } = useAuth();
  const [q, setQ] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      navigate({ to: "/search", search: { q: q.trim() } });
      setMobileOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-3 sm:gap-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground font-bold text-lg">
              S
            </div>
            <span className="hidden font-display text-xl font-semibold sm:block">ShopHub</span>
          </Link>

          <form onSubmit={onSearch} className="flex flex-1 max-w-2xl items-center">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products, brands, categories..."
              className="h-10 rounded-r-none border-0 bg-card text-foreground focus-visible:ring-2 focus-visible:ring-accent"
            />
            <Button
              type="submit"
              size="icon"
              className="h-10 rounded-l-none bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>

          <div className="flex items-center gap-1 sm:gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-10 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground gap-2 px-2 sm:px-3">
                    <User className="h-4 w-4" />
                    <span className="hidden text-sm md:inline max-w-[100px] truncate">
                      {user.email?.split("@")[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate({ to: "/account/orders" })}>
                    <Package className="mr-2 h-4 w-4" /> My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: "/account/addresses" })}>
                    <User className="mr-2 h-4 w-4" /> Addresses
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate({ to: "/admin" })}>
                        <Shield className="mr-2 h-4 w-4" /> Admin Panel
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut().then(() => navigate({ to: "/" }))}>
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button variant="ghost" size="sm" className="h-10 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground gap-2 px-2 sm:px-3">
                  <User className="h-4 w-4" />
                  <span className="hidden text-sm sm:inline">Sign in</span>
                </Button>
              </Link>
            )}

            <Link to="/cart">
              <Button variant="ghost" size="sm" className="h-10 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground gap-2 px-2 sm:px-3 relative">
                <ShoppingCart className="h-5 w-5" />
                {totalCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-accent-foreground">
                    {totalCount}
                  </span>
                )}
                <span className="hidden text-sm md:inline">Cart</span>
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="h-10 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Category bar */}
      <div className="hidden border-b border-border bg-card lg:block">
        <div className="mx-auto flex h-11 max-w-7xl items-center gap-1 px-6 overflow-x-auto">
          <Link
            to="/"
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors hover:bg-muted whitespace-nowrap",
              path === "/" && "text-primary",
            )}
          >
            All
          </Link>
          {CATEGORY_LINKS.map((c) => (
            <Link
              key={c.slug}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors hover:bg-muted whitespace-nowrap"
              activeProps={{ className: "text-primary bg-muted" }}
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-b border-border bg-card lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-2">
            <Link to="/" onClick={() => setMobileOpen(false)} className="border-b border-border py-3 text-sm font-medium">
              Home
            </Link>
            {CATEGORY_LINKS.map((c) => (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                onClick={() => setMobileOpen(false)}
                className="border-b border-border py-3 text-sm font-medium"
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
