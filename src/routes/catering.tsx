import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Loader2, Briefcase, Home, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/catering")({
  head: () => ({
    meta: [
      { title: "Catering & Bulk Orders — Asansol Momos" },
      { name: "description", content: "Office lunches, house parties, weddings — we'll steam hundreds of momos and bring them piping hot." },
      { property: "og:title", content: "Catering & Bulk Orders — Asansol Momos" },
      { property: "og:description", content: "Bulk momo catering for offices, parties and events in Asansol." },
    ],
  }),
  component: CateringPage,
});

const PACKAGES = [
  {
    icon: Briefcase,
    title: "Office Lunch",
    range: "20 – 100 people",
    desc: "Perfect for team lunches and corporate gatherings. Mixed steamed & fried baskets with chutneys.",
  },
  {
    icon: Home,
    title: "House Party",
    range: "10 – 50 people",
    desc: "Show up, eat momos, be a hero. We deliver hot, you serve. Optional live steaming setup.",
  },
  {
    icon: PartyPopper,
    title: "Events & Weddings",
    range: "100+ people",
    desc: "Live momo counter at your venue. Steamed, fried and tandoori on demand for your guests.",
  },
];

const inquirySchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  phone: z.string().trim().min(5, "Please enter a valid phone").max(20),
  email: z.string().trim().email("Invalid email").max(255).optional().or(z.literal("")),
  event_date: z.string().optional().or(z.literal("")),
  headcount: z.string().optional().or(z.literal("")),
  occasion: z.string().trim().max(100).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});

function CateringPage() {
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = Object.fromEntries(fd.entries()) as Record<string, string>;
    const parsed = inquirySchema.safeParse(raw);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("catering_inquiries").insert({
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      event_date: parsed.data.event_date || null,
      headcount: parsed.data.headcount ? parseInt(parsed.data.headcount, 10) : null,
      occasion: parsed.data.occasion || null,
      message: parsed.data.message || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't send your request. Please try again.");
      return;
    }
    toast.success("Got it! We'll get back to you within a few hours.");
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div>
      <section className="bg-gradient-warm">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-accent">Catering & Bulk Orders</p>
          <h1 className="font-display text-5xl font-bold text-primary text-balance sm:text-6xl">
            Momos for everyone you love.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            From office lunches to wedding receptions, we'll handle the steamers. You handle the smiles.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {PACKAGES.map((p) => (
            <div key={p.title} className="rounded-2xl border border-border bg-card p-8 shadow-soft transition-transform hover:-translate-y-1 hover:shadow-warm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-2xl font-bold text-primary">{p.title}</h3>
              <p className="mt-1 text-sm font-medium text-accent">{p.range}</p>
              <p className="mt-3 text-sm text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-warm sm:p-12">
          <h2 className="font-display text-3xl font-bold text-primary">Tell us about your event</h2>
          <p className="mt-2 text-sm text-muted-foreground">We'll reply with a quote within a few hours.</p>

          <form onSubmit={onSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" required maxLength={100} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" name="phone" type="tel" required maxLength={20} className="mt-1.5" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" maxLength={255} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="event_date">Event date</Label>
              <Input id="event_date" name="event_date" type="date" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="headcount">Approx. headcount</Label>
              <Input id="headcount" name="headcount" type="number" min={1} max={10000} className="mt-1.5" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="occasion">Occasion</Label>
              <Input id="occasion" name="occasion" maxLength={100} placeholder="Office lunch, birthday, wedding…" className="mt-1.5" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="message">Anything else?</Label>
              <Textarea id="message" name="message" rows={4} maxLength={2000} className="mt-1.5" />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" size="lg" disabled={submitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Request"}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
