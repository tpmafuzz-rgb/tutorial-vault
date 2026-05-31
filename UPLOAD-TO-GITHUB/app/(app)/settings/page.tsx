"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Palette,
  Database,
  Download,
  Check,
  LogOut,
} from "lucide-react";
import { useVault } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

function Card({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-line bg-surface text-muted">
          {icon}
        </span>
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight text-ink">
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-[13px] text-muted">{description}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

export default function SettingsPage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const store = useVault();
  const { profile, theme, setProfile, setTheme } = store;

  const [name, setName] = React.useState(profile.authorName);
  const [book, setBook] = React.useState(profile.bookTitle);
  const [saved, setSaved] = React.useState(false);
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [signingOut, setSigningOut] = React.useState(false);

  React.useEffect(() => {
    setName(profile.authorName);
    setBook(profile.bookTitle);
  }, [profile.authorName, profile.bookTitle]);

  const saveProfile = async () => {
    setSavingProfile(true);
    await setProfile({ authorName: name.trim(), bookTitle: book.trim() });
    setSavingProfile(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  // Read-only export of the current vault as JSON (a personal backup).
  const exportData = () => {
    const snapshot = {
      tutorials: store.tutorials,
      categories: store.categories,
      assets: store.assets,
      profile: store.profile,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tutorial-vault-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const signOut = async () => {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Settings" subtitle="Your profile, theme, and data — kept simple." />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card icon={<User size={16} />} title="Profile" description="Used on your exported book.">
          <div className="space-y-4">
            <Field label="Author Name">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Default Book Title">
              <Input value={book} onChange={(e) => setBook(e.target.value)} />
            </Field>
            <div className="flex justify-end">
              <Button onClick={saveProfile} disabled={savingProfile}>
                {saved ? <Check size={15} /> : null}
                {saved ? "Saved" : savingProfile ? "Saving…" : "Save Profile"}
              </Button>
            </div>
          </div>
        </Card>

        <Card icon={<Palette size={16} />} title="Theme" description="Light is recommended for the premium look.">
          <div className="grid grid-cols-2 gap-3">
            {(["light", "dim"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={cn(
                  "rounded-xl border p-4 text-left transition-all",
                  theme === t
                    ? "border-ink ring-2 ring-ink/10"
                    : "border-line hover:border-ink/30"
                )}
              >
                <div
                  className={cn(
                    "mb-3 h-14 w-full rounded-lg border",
                    t === "light"
                      ? "border-line bg-gradient-to-br from-white to-surface"
                      : "border-ink/40 bg-gradient-to-br from-[#1a1a1c] to-[#0b0b0c]"
                  )}
                />
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-ink capitalize">
                    {t}
                  </span>
                  {theme === t && <Check size={14} className="text-ink" />}
                </div>
              </button>
            ))}
          </div>
          <p className="mt-3 text-[12px] text-muted">
            Dim theme tokens are defined and ship in a later phase.
          </p>
        </Card>

        <Card
          icon={<Database size={16} />}
          title="Your Data"
          description="Everything is yours — download a backup anytime."
        >
          <Button variant="secondary" onClick={exportData}>
            <Download size={15} />
            Export / Backup (JSON)
          </Button>
          {hydrated && (
            <p className="mt-3 text-[12px] text-muted">
              {store.tutorials.length} tutorials · {store.assets.length} assets ·{" "}
              {store.categories.length} categories saved to your account.
            </p>
          )}
        </Card>

        <Card
          icon={<LogOut size={16} />}
          title="Account"
          description="Signed in and synced to your private Supabase vault."
        >
          <Button variant="danger" onClick={signOut} disabled={signingOut}>
            <LogOut size={15} />
            {signingOut ? "Signing out…" : "Sign Out"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
