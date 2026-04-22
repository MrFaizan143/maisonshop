import { createFileRoute } from "@tanstack/react-router";
import heroImg from "@/assets/hero-stall.jpg";
import steamedImg from "@/assets/momo-steamed.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — Asansol Momos" },
      { name: "description", content: "How a little wooden cart on Burnpur Road became Asansol's beloved momo destination." },
      { property: "og:title", content: "Our Story — Asansol Momos" },
      { property: "og:description", content: "Family recipe, hand-folded daily, steamed in bamboo since 2023." },
      { property: "og:image", content: heroImg },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div>
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={heroImg} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-primary/70" />
        </div>
        <div className="mx-auto max-w-4xl px-4 py-28 text-center text-cream sm:px-6 lg:px-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-accent">Our Story</p>
          <h1 className="font-display text-5xl font-bold text-balance sm:text-6xl">
            A wooden cart, a family recipe, and a whole lot of momos.
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="prose-lg space-y-8 text-foreground/90">
          <p className="text-xl leading-relaxed text-balance">
            We started in 2023 with one bamboo steamer, a wooden cart, and a recipe scribbled on the back of an old envelope. Today, that same recipe still steams in our kitchen every morning at 5am.
          </p>

          <div className="my-12 overflow-hidden rounded-3xl shadow-warm">
            <img
              src={steamedImg}
              alt="Freshly steamed momos in a bamboo basket"
              loading="lazy"
              width={1024}
              height={1024}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>

          <h2 className="font-display text-3xl font-bold text-primary">The Recipe</h2>
          <p>
            Our dough is rested for two hours. Our fillings are chopped — never minced into mush. We fold each momo by hand because a machine just can't make those perfect pleats. It's slower. It's harder. But it's how momos are meant to be.
          </p>

          <h2 className="font-display text-3xl font-bold text-primary">The Process</h2>
          <p>
            Every morning, our team folds momos for three hours straight. Steamed momos go in bamboo. Fried momos hit hot oil only when ordered. Tandoori momos meet the clay oven seconds before they reach you. Nothing sits. Nothing waits.
          </p>

          <h2 className="font-display text-3xl font-bold text-primary">The Stall</h2>
          <p>
            Find us on Burnpur Road, glowing under string lights every evening. Pull up a stool, order a steamer basket, and dip into our family-recipe red chutney. We promise — that first bite will make sense of everything.
          </p>
        </div>
      </section>
    </div>
  );
}
