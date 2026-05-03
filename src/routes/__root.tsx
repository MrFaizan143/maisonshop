import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { DragToCartProvider } from "@/components/drag-to-cart-provider";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { CartSync } from "@/components/cart-sync";
import { serializeJsonLd } from "@/lib/safe-json-ld";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Maison — A Modern Department Store" },
      {
        name: "description",
        content:
          "Editorial fashion. Lush food. Sharp electronics. One destination — Maison. Cash on Delivery across India.",
      },
      { name: "author", content: "Maison" },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Maison — A Modern Department Store" },
      {
        property: "og:description",
        content:
          "Editorial fashion. Lush food. Sharp electronics. One destination — Maison. Cash on Delivery across India.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Maison" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Maison — A Modern Department Store" },
      {
        name: "twitter:description",
        content:
          "Editorial fashion. Lush food. Sharp electronics. One destination — Maison. Cash on Delivery across India.",
      },
      { name: "description", content: "Maisonshop is a fully-featured e-commerce website for selling products online." },
      { property: "og:description", content: "Maisonshop is a fully-featured e-commerce website for selling products online." },
      { name: "twitter:description", content: "Maisonshop is a fully-featured e-commerce website for selling products online." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/5az5njxy98a8IUDrwm9S79i1ErE2/social-images/social-1777800599647-1000283060.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/5az5njxy98a8IUDrwm9S79i1ErE2/social-images/social-1777800599647-1000283060.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Instrument+Serif&family=Geist:wght@400;500;600&family=Geist+Mono:wght@400&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Maison",
    description: "Modern department store with fashion, food, electronics, home, and beauty.",
  };
  return (
    <AuthProvider>
      <ThemeProvider>
        <DragToCartProvider>
          <CartSync />
          <div className="flex min-h-screen flex-col">
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
            >
              Skip to main content
            </a>
            <AnnouncementBar />
            <SiteHeader />
            <main id="main-content" className="flex-1">
              <Outlet />
            </main>
            <SiteFooter />
            <WhatsAppButton />
            <Toaster position="top-center" richColors />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: serializeJsonLd(orgSchema) }}
            />
          </div>
        </DragToCartProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
