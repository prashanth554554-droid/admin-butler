import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { claimFirstAdmin } from "@/lib/video.functions";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Sign in — Prompt Studio AI" },
      {
        name: "description",
        content: "Sign in to Prompt Studio AI to generate AI videos and manage your studio.",
      },
      { property: "og:title", content: "Sign in — Prompt Studio AI" },
      { property: "og:description", content: "Access the Prompt Studio AI video studio." },
    ],
  }),
  component: LoginPage,
});

function safePath(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/add-prompt";
  return value;
}

function LoginPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const target = safePath(redirect);

  useEffect(() => {
    if (!loading && user) navigate({ to: target });
  }, [loading, user, target, navigate]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}${target}` },
        });
        if (error) throw error;
        toast.success("Account created. You can start creating now.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
      }
      navigate({ to: target });
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: target });
  };

  const claimAdmin = async () => {
    setBusy(true);
    try {
      const result = await claimFirstAdmin();
      if (result.granted) {
        toast.success("You are now the site admin. Reload to see the dashboard.");
      } else {
        toast.error(result.reason ?? "Could not grant admin access.");
      }
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="halo flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8">
        <h1 className="font-display text-2xl font-semibold">
          {mode === "signin" ? "Sign in to Prompt Studio AI" : "Create your account"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Generate AI videos, save your renders and manage the studio.
        </p>

        <Button
          type="button"
          variant="secondary"
          className="mt-6 w-full"
          disabled={busy}
          onClick={google}
        >
          Continue with Google
        </Button>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or use email
          <span className="h-px flex-1 bg-border" />
        </div>

        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            disabled={busy}
            className="w-full bg-gradient-brand text-brand-foreground"
          >
            {mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <button
          type="button"
          className="mt-5 w-full text-sm text-muted-foreground underline-offset-4 hover:underline"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin"
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </button>

        {user && !isAdmin ? (
          <div className="mt-8 rounded-2xl border border-border bg-surface p-4">
            <p className="flex items-center gap-2 text-sm font-medium">
              <ShieldCheck className="size-4 text-brand" /> First-time setup
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              If no admin exists yet, you can claim admin access for this site.
            </p>
            <Button size="sm" variant="secondary" className="mt-3" disabled={busy} onClick={claimAdmin}>
              Claim admin access
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
