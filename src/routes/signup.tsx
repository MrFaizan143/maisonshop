import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — Maison" }] }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/" });
  }, [user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl },
    });
    setLoading(false);
    if (error) {
      toast.error("Sign up failed", { description: error.message });
      return;
    }
    toast.success("Account created — welcome!");
    navigate({ to: "/" });
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-[1400px] items-center px-5 py-16 sm:px-8">
      <div className="w-full max-w-sm">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          — Account
        </p>
        <h1 className="mt-4 editorial-headline text-5xl">Join us.</h1>
        <p className="mt-3 text-sm text-muted-foreground">Start shopping in seconds.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <Label
              htmlFor="email"
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="mt-1.5 rounded-none border-x-0 border-t-0 border-b border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-foreground"
            />
          </div>
          <div>
            <Label
              htmlFor="password"
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
            >
              Password (min 6 chars)
            </Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="mt-1.5 rounded-none border-x-0 border-t-0 border-b border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-foreground"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90 font-mono text-[11px] uppercase tracking-[0.22em]"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-foreground hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
