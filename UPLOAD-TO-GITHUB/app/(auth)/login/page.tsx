"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Sparkles, Mail, Check, AlertCircle } from "lucide-react";

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [busy, setBusy] = React.useState<"google" | "email" | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const signInGoogle = async () => {
    setError(null);
    setBusy("google");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${location.origin}/auth/callback` },
      });
      if (error) throw error;
      // browser redirects to Google
    } catch (e) {
      setError("Couldn't start Google sign-in. Check your Supabase config.");
      setBusy(null);
    }
  };

  const signInEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    setBusy("email");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${location.origin}/auth/callback` },
      });
      if (error) throw error;
      setSent(true);
    } catch {
      setError("Couldn't send the magic link. Try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="w-full max-w-[380px]">
      <div className="mb-7 text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-ink text-white">
          <span className="text-[19px] font-bold tracking-tight">T</span>
        </div>
        <h1 className="text-[22px] font-semibold tracking-tighter text-ink">
          Welcome to TUTORIAL
        </h1>
        <p className="mt-1 text-[13.5px] text-muted">
          Your personal editing encyclopedia.
        </p>
      </div>

      <div className="card p-6">
        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-[12.5px] text-rose-700">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <Button
          variant="secondary"
          className="w-full"
          onClick={signInGoogle}
          disabled={busy !== null}
        >
          <GoogleIcon />
          {busy === "google" ? "Redirecting…" : "Continue with Google"}
        </Button>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-line" />
          <span className="text-[11.5px] uppercase tracking-wide text-muted">
            or
          </span>
          <span className="h-px flex-1 bg-line" />
        </div>

        {sent ? (
          <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-[13px] text-emerald-800">
            <Check size={16} className="mt-0.5 shrink-0" />
            <span>
              Magic link sent to <strong>{email}</strong>. Check your inbox to
              finish signing in.
            </span>
          </div>
        ) : (
          <form onSubmit={signInEmail} className="space-y-3">
            <Field label="Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@studio.com"
                required
              />
            </Field>
            <Button type="submit" className="w-full" disabled={busy !== null}>
              <Mail size={15} />
              {busy === "email" ? "Sending…" : "Email me a magic link"}
            </Button>
          </form>
        )}
      </div>

      <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[12px] text-muted">
        <Sparkles size={12} />
        Private by design — your vault is yours alone.
      </p>
    </div>
  );
}
