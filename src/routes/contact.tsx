import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { MapPin, Phone, Mail, Clock, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Asansol Momos" },
      { name: "description", content: "Find us on Burnpur Road, Asansol. Open daily 11am–11pm. Call, WhatsApp, or drop by." },
      { property: "og:title", content: "Contact — Asansol Momos" },
      { property: "og:description", content: "Find us on Burnpur Road, Asansol. Open daily 11am–11pm." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(1).max(1000),
});

function ContactPage() {
  const [sending, setSending] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd.entries()));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSending(true);
    // Open WhatsApp with prefilled message (no PII stored)
    const text = encodeURIComponent(`Hi! I'm ${parsed.data.name} (${parsed.data.email}).\n\n${parsed.data.message}`);
    window.open(`https://wa.me/919876543210?text=${text}`, "_blank");
    setSending(false);
    toast.success("Opening WhatsApp…");
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-12 pb-24 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-accent">Contact</p>
        <h1 className="font-display text-5xl font-bold text-primary sm:text-6xl">Come say hi</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Drop by the stall, ring us up, or send a WhatsApp — whichever feels easiest.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {[
              { icon: MapPin, title: "Find us", text: "Burnpur Road, Asansol\nWest Bengal 713304" },
              { icon: Clock, title: "Open hours", text: "Every day\n11:00am – 11:00pm" },
              { icon: Phone, title: "Call", text: "+91 98765 43210", href: "tel:+919876543210" },
              { icon: MessageCircle, title: "WhatsApp", text: "+91 98765 43210", href: "https://wa.me/919876543210" },
              { icon: Mail, title: "Email", text: "hello@asansolmomos.in", href: "mailto:hello@asansolmomos.in" },
            ].map((c) => (
              <div key={c.title} className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <c.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-primary">{c.title}</h3>
                  {c.href ? (
                    <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="text-sm text-muted-foreground hover:text-accent">
                      {c.text}
                    </a>
                  ) : (
                    <p className="whitespace-pre-line text-sm text-muted-foreground">{c.text}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-border shadow-soft">
            <iframe
              title="Asansol Momos location"
              src="https://www.google.com/maps?q=Burnpur+Road,+Asansol,+West+Bengal&output=embed"
              width="100%"
              height="280"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-warm sm:p-10">
            <h2 className="font-display text-2xl font-bold text-primary">Send a quick message</h2>
            <p className="mt-1 text-sm text-muted-foreground">We'll continue the chat over WhatsApp.</p>
            <form onSubmit={onSubmit} className="mt-6 space-y-5">
              <div>
                <Label htmlFor="name">Your name</Label>
                <Input id="name" name="name" required maxLength={100} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required maxLength={255} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" name="message" required rows={5} maxLength={1000} className="mt-1.5" />
              </div>
              <Button type="submit" size="lg" disabled={sending} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send via WhatsApp"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
