<div align="center">

# 🛍️ Maison

### A Modern Department Store — Editorial Fashion · Lush Food · Sharp Electronics

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-backend-3fcf8e?logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel&logoColor=white)](https://vercel.com/)

> Cash on Delivery across India · Free shipping ₹499+ · Seven-day returns

</div>

---

## ✨ Features

- **Multi-category storefront** — Fashion, Grocery, Electronics, Home & Beauty
- **Full cart & checkout** — add to cart, quantity controls, Cash on Delivery
- **User accounts** — sign up, log in, saved addresses, order history
- **Admin panel** — create, edit, and manage the product catalogue
- **Drag-to-cart** — drag any product card directly into the cart
- **Recently viewed** — personalized browsing history (local storage)
- **Newsletter sign-up** — stay-in-the-loop subscription strip
- **Announcement bar** — configurable site-wide messages
- **SSR-ready** — server-side rendering via TanStack Start + Vercel Edge functions
- **Accessible UI** — built on Radix UI primitives with full keyboard & screen-reader support

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React 19](https://react.dev/) + [TanStack Start](https://tanstack.com/start) |
| Routing | [TanStack Router](https://tanstack.com/router) (file-based) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) + [tw-animate-css](https://github.com/jamiebuilds/tw-animate-css) |
| UI Components | [Radix UI](https://www.radix-ui.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| Backend / DB | [Supabase](https://supabase.com/) (Postgres + Auth + Storage) |
| Server State | [TanStack Query](https://tanstack.com/query) |
| Client State | [Zustand](https://zustand-demo.pmnd.rs/) |
| Forms | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| Build | [Vite 7](https://vitejs.dev/) |
| Deployment | [Vercel](https://vercel.com/) (SSR via `api/ssr.ts`) |

---

## 📁 Project Structure

```
maisonshop/
├── api/                    # Vercel serverless entry (SSR handler)
├── src/
│   ├── assets/             # Static images (category banners, etc.)
│   ├── components/         # Shared UI components
│   │   └── ui/             # Base Radix-powered components (Button, Dialog, …)
│   ├── contexts/           # React context providers
│   ├── hooks/              # Custom React hooks
│   ├── integrations/
│   │   └── supabase/       # Supabase client (browser + server)
│   ├── lib/                # Utilities (analytics, validation, constants, …)
│   ├── routes/             # File-based routes (TanStack Router)
│   │   ├── index.tsx           # Home page
│   │   ├── product.$slug.tsx   # Product detail
│   │   ├── category.$slug.tsx  # Category listing
│   │   ├── cart.tsx            # Cart
│   │   ├── checkout.tsx        # Checkout
│   │   ├── search.tsx          # Search
│   │   ├── login.tsx           # Authentication
│   │   ├── signup.tsx
│   │   ├── account.orders.tsx  # Account — orders
│   │   ├── account.addresses.tsx
│   │   ├── admin.tsx           # Admin dashboard
│   │   ├── admin.products.tsx
│   │   ├── admin.products.new.tsx
│   │   └── admin.products.$id.tsx
│   ├── stores/             # Zustand stores (cart, etc.)
│   └── styles.css          # Global styles & Tailwind config
├── supabase/
│   ├── config.toml         # Supabase local dev config
│   └── migrations/         # Database migration files (SQL)
├── .env.example            # Environment variable template
├── vercel.json             # Vercel deployment config
└── vite.config.ts          # Vite + TanStack plugin config
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) **≥ 22** (see `engines` in `package.json`)
- [npm](https://www.npmjs.com/) (bundled with Node) or [bun](https://bun.sh/)
- A [Supabase](https://supabase.com/) project (free tier works)

### 1. Clone & install

```bash
git clone https://github.com/MrFaizan143/maisonshop.git
cd maisonshop
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your Supabase credentials:

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon / public key |
| `VITE_SUPABASE_PROJECT_ID` | Your Supabase project reference ID |
| `SUPABASE_URL` | Same URL (used server-side) |
| `SUPABASE_PUBLISHABLE_KEY` | Same anon key (used server-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — **server-side only, never expose to the browser** |

> 💡 Find these in your Supabase dashboard → **Project Settings → API**.

### 3. Apply database migrations

```bash
npx supabase db push
# or for local development:
npx supabase start
npx supabase db reset
```

### 4. Start the dev server

```bash
npm run dev
```

The app is now running at **[http://localhost:3000](http://localhost:3000)**.

---

## 📜 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server with HMR |
| `npm run build` | Production build (outputs to `dist/`) |
| `npm run build:dev` | Development build (useful for debugging) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the entire project |
| `npm run format` | Auto-format all files with Prettier |

---

## ☁️ Deployment

The project is pre-configured for **Vercel** with SSR via a serverless function.

### One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FMrFaizan143%2Fmaisonshop)

### Manual deploy

1. Push your fork to GitHub.
2. Import the repo in the [Vercel dashboard](https://vercel.com/new).
3. Add the environment variables from `.env.example` in the Vercel project settings.
4. Vercel will use the settings in `vercel.json` automatically.

---

## 🗄️ Database

Maison uses **Supabase** (Postgres) as its backend. Migrations live in `supabase/migrations/` and are applied in chronological order.

Key tables:

| Table | Purpose |
|---|---|
| `products` | Product catalogue (name, price, stock, category, images, ratings) |
| `orders` | Customer orders and line items |
| `catering_inquiries` | Bulk / catering inquiry form submissions |

Row-Level Security (RLS) is enabled on all tables. Authenticated users manage products and view inquiries; anonymous visitors can browse products and submit inquiries.

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository and create a feature branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Make your changes and ensure the code passes linting:
   ```bash
   npm run lint
   npm run build
   ```
3. Commit using a clear, descriptive message.
4. Open a **Pull Request** against `main` with a summary of your changes.

Please keep PRs focused and small — one feature or fix per PR.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/MrFaizan143">MrFaizan143</a></sub>
</div>
