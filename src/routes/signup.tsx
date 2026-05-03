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

function passwordStrength(pwd: string): { label: string; colorClass: string } {
  if (pwd.length === 0) return { label: "", colorClass: "" };
  if (pwd.length < 8) return { label: "Too short", colorClass: "text-destructive" };
  let score = 0;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score === 0) return { label: "Weak", colorClass: "text-deal" };
  if (score === 1) return { label: "Fair", colorClass: "text-yellow-600" };
  if (score === 2) return { label: "Good", colorClass: "text-success" };
  return { label: "Strong", colorClass: "text-success" };
}

function SignupPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/" });
  }, [user, navigate]);

  const strength = passwordStrength(password);
  const confirmError = confirm && confirm !== password ? "Passwords do not match" : "";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl },
    });
    setLoading(false);
    if (error) {
      console.error("[signup] sign-up error:", error);
      toast.error("Sign up failed. Please try again.");
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
              Password (min 8 chars)
            </Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="mt-1.5 rounded-none border-x-0 border-t-0 border-b border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-foreground"
            />
            {password && (
              <p className={`mt-1 font-mono text-[11px] ${strength.colorClass}`}>
                {strength.label}
              </p>
            )}
          </div>
          <div>
            <Label
              htmlFor="confirm"
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
            >
              Confirm password
            </Label>
            <Input
              id="confirm"
              type="password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              aria-invalid={!!confirmError}
              className="mt-1.5 rounded-none border-x-0 border-t-0 border-b border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-foreground"
            />
            {confirmError && <p className="mt-1 text-[11px] text-destructive">{confirmError}</p>}
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
