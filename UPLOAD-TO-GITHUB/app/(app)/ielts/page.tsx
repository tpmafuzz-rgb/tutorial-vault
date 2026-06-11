"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Target,
  Flame,
  CalendarCheck,
  ArrowRight,
  Trash2,
  Archive,
  CheckCircle2,
} from "lucide-react";
import { useVault } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import { formatDate } from "@/lib/utils";
import {
  completedCount,
  currentStreak,
  IELTS_TOTAL_DAYS,
} from "@/lib/ielts";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { ProgressGrid } from "@/components/ielts/ProgressGrid";
import type { IeltsChallenge } from "@/lib/types";

export default function IeltsPage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const {
    ieltsChallenges,
    ieltsDays,
    profile,
    addIeltsChallenge,
    setIeltsStatus,
    deleteIeltsChallenge,
  } = useVault();

  const [openNew, setOpenNew] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<IeltsChallenge | null>(null);
  const [form, setForm] = React.useState({
    studentName: "",
    targetBand: "",
    startDate: new Date().toISOString().slice(0, 10),
    targetDate: "",
  });

  React.useEffect(() => {
    if (openNew) {
      setForm((f) => ({ ...f, studentName: f.studentName || profile.authorName }));
    }
  }, [openNew, profile.authorName]);

  const active = ieltsChallenges.filter((c) => c.status === "active");
  const past = ieltsChallenges.filter((c) => c.status !== "active");

  const daysOf = (id: string) => ieltsDays.filter((d) => d.challengeId === id);

  const create = async () => {
    if (saving) return;
    setSaving(true);
    const id = await addIeltsChallenge(form);
    setSaving(false);
    if (id) {
      setOpenNew(false);
      router.push(`/ielts/${id}`);
    }
  };

  if (!hydrated) return <div className="skeleton h-screen rounded-2xl" />;

  return (
    <div className="animate-fade-in pb-10">
      <PageHeader
        title="IELTS Challenges"
        subtitle="The 30-Day Comeback Challenge — Listening · Reading · Writing · Speaking, every day."
        actions={
          <Button className="ws-accent-bg" onClick={() => setOpenNew(true)}>
            <Plus size={15} />
            Start New Challenge
          </Button>
        }
      />

      {ieltsChallenges.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-surface/50 px-6 py-16 text-center">
          <Target size={22} className="mx-auto mb-3 text-muted" />
          <p className="text-[15px] font-medium text-ink">No challenge yet</p>
          <p className="mx-auto mt-1 max-w-md text-[13px] leading-relaxed text-muted">
            Start your 30-day comeback. Every day you practise all four modules —
            no module skipped, no day wasted — and track it here instead of on
            paper.
          </p>
          <Button className="ws-accent-bg mt-5" onClick={() => setOpenNew(true)}>
            <Plus size={15} />
            Start Day 1
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active challenges */}
          {active.map((c) => {
            const days = daysOf(c.id);
            const done = completedCount(days);
            const streak = currentStreak(days);
            return (
              <div key={c.id} className="card p-6">
                <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="rounded-md bg-surface px-2 py-0.5 font-mono text-[12px] font-medium text-muted">
                        {c.serial}
                      </span>
                      <span className="ws-tint ws-accent-text rounded-md px-2 py-0.5 text-[11.5px] font-semibold">
                        ACTIVE
                      </span>
                    </div>
                    <h2 className="mt-2 text-[20px] font-semibold tracking-tight text-ink">
                      {c.studentName || "My Comeback Challenge"}
                    </h2>
                    <p className="mt-0.5 text-[12.5px] text-muted">
                      {c.targetBand && <>Target Band {c.targetBand} · </>}
                      {c.startDate && <>Started {formatDate(c.startDate)}</>}
                    </p>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-[22px] font-semibold tabular-nums text-ink">
                        <Flame size={18} className="ws-accent-text" />
                        {streak}
                      </div>
                      <div className="text-[11px] text-muted">day streak</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[22px] font-semibold tabular-nums text-ink">
                        {done}
                        <span className="text-[14px] text-muted">/{IELTS_TOTAL_DAYS}</span>
                      </div>
                      <div className="text-[11px] text-muted">days complete</div>
                    </div>
                  </div>
                </div>

                <ProgressGrid challengeId={c.id} days={days} />

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <Link href={`/ielts/${c.id}`}>
                    <Button variant="secondary" size="sm">
                      Open challenge
                      <ArrowRight size={14} />
                    </Button>
                  </Link>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIeltsStatus(c.id, "completed")}
                      title="Mark the whole challenge finished"
                    >
                      <CheckCircle2 size={14} />
                      Finish
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIeltsStatus(c.id, "archived")}
                    >
                      <Archive size={14} />
                      Archive
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Past challenges */}
          {past.length > 0 && (
            <div>
              <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-muted">
                Past Challenges
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {past.map((c) => {
                  const days = daysOf(c.id);
                  const done = completedCount(days);
                  return (
                    <div
                      key={c.id}
                      className="card flex items-center justify-between gap-3 p-4"
                    >
                      <Link href={`/ielts/${c.id}`} className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11.5px] text-muted">
                            {c.serial}
                          </span>
                          <span className="rounded-md bg-surface px-1.5 py-0.5 text-[10.5px] font-medium uppercase text-muted">
                            {c.status}
                          </span>
                        </div>
                        <div className="mt-1 truncate text-[14px] font-medium text-ink">
                          {c.studentName || "Comeback Challenge"}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-muted">
                          <CalendarCheck size={12} />
                          {done}/{IELTS_TOTAL_DAYS} days complete
                        </div>
                      </Link>
                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIeltsStatus(c.id, "active")}
                        >
                          Resume
                        </Button>
                        <button
                          onClick={() => setConfirmDel(c)}
                          className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-rose-50 hover:text-rose-600"
                          aria-label="Delete challenge"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* New challenge modal */}
      <Modal
        open={openNew}
        onClose={() => setOpenNew(false)}
        title="Start a 30-Day Challenge"
        description="No module skipped · No day wasted · No excuse accepted."
      >
        <div className="space-y-4">
          <Field label="Student Name">
            <Input
              value={form.studentName}
              onChange={(e) => setForm({ ...form, studentName: e.target.value })}
              placeholder="Your name"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Target Band">
              <Input
                value={form.targetBand}
                onChange={(e) => setForm({ ...form, targetBand: e.target.value })}
                placeholder="7.5"
              />
            </Field>
            <Field label="Start Date">
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </Field>
            <Field label="Target Date" optional>
              <Input
                type="date"
                value={form.targetDate}
                onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
              />
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" onClick={() => setOpenNew(false)}>
              Cancel
            </Button>
            <Button className="ws-accent-bg" onClick={create} disabled={saving}>
              {saving ? "Starting…" : "Start Challenge"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={confirmDel !== null}
        onClose={() => setConfirmDel(null)}
        title="Delete this challenge?"
        description={
          confirmDel
            ? `"${confirmDel.serial}" and all its tracked days will be permanently removed. This can't be undone.`
            : undefined
        }
      >
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmDel(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (confirmDel) deleteIeltsChallenge(confirmDel.id);
              setConfirmDel(null);
            }}
          >
            <Trash2 size={14} />
            Delete Challenge
          </Button>
        </div>
      </Modal>
    </div>
  );
}
