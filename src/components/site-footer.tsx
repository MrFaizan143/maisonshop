import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="anchor-mono bg-[oklch(0.08_0_0)] text-[oklch(0.99_0_0)] mt-24">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-editorial text-3xl tracking-tight">Maison</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">— shop</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-white/60 leading-relaxed">
              A modern department store. Editorial fashion. Lush food. Sharp electronics. One destination.
            </p>
          </div>

          <FooterCol
            title="Shop"
            links={[
              { to: "/category/$slug", params: { slug: "fashion" }, label: "Fashion" },
              { to: "/category/$slug", params: { slug: "grocery" }, label: "Food" },
              { to: "/category/$slug", params: { slug: "electronics" }, label: "Electronics" },
              { to: "/category/$slug", params: { slug: "home" }, label: "Home" },
              { to: "/category/$slug", params: { slug: "beauty" }, label: "Beauty" },
            ]}
          />
          <FooterCol
            title="Account"
            links={[
              { to: "/login", label: "Sign in" },
              { to: "/signup", label: "Create account" },
              { to: "/account/orders", label: "Orders" },
              { to: "/account/addresses", label: "Addresses" },
            ]}
          />
          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">Promise</h3>
            <ul className="mt-5 space-y-3 text-sm text-white/80">
              <li>Cash on Delivery</li>
              <li>Free shipping over ₹499</li>
              <li>7-day returns</li>
              <li>Verified sellers</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col-reverse items-start justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
            © {new Date().getFullYear()} Maison · Made in India
          </div>
          <div className="font-editorial text-xl text-white/30 italic">— shop with intention.</div>
        </div>
      </div>
    </footer>
  );
}

type LinkItem = { to: string; label: string; params?: Record<string, string> };

function FooterCol({ title, links }: { title: string; links: LinkItem[] }) {
  return (
    <div>
      <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">{title}</h3>
      <ul className="mt-5 space-y-3 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            {/* @ts-expect-error dynamic to */}
            <Link to={l.to} params={l.params} className="text-white/80 hover:text-white transition">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
