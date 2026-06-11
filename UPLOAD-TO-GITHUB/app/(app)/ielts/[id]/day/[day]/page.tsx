"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Headphones,
  BookOpenText,
  PenLine,
  Mic,
  BookMarked,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useVault } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import {
  emptyIeltsDay,
  isDayComplete,
  LISTENING_ERROR_TYPES,
  READING_MISSED_TYPES,
  SPEAKING_IDENTIFY,
  SUCCESS_RULE,
  suggestedDate,
  IELTS_TOTAL_DAYS,
  WRITING_ANALYSE,
  writingTaskLabel,
} from "@/lib/ielts";
import type { IeltsDay } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

/** Toggle-chip group for the tracker's checkbox rows. */
function CheckGroup({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (opt: string) =>
    onChange(
      value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]
    );
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const on = value.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={cn(
              "rounded-lg border px-2.5 py-1.5 text-[12.5px] font-medium transition-all",
              on
                ? "ws-accent-bg border-transparent bg-ink text-white"
                : "border-line bg-canvas text-muted hover:border-ink/20 hover:text-ink"
            )}
            aria-pressed={on}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function SectionCard({
  icon: Icon,
  part,
  title,
  time,
  children,
}: {
  icon: typeof Headphones;
  part: string;
  title: string;
  time: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="ws-accent-bg grid h-9 w-9 place-items-center rounded-xl bg-ink text-white">
            <Icon size={16} />
          </span>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              {part}
            </div>
            <h2 className="text-[15.5px] font-semibold tracking-tight text-ink">
              {title}
            </h2>
          </div>
        </div>
        <span className="rounded-md bg-surface px-2 py-0.5 text-[11.5px] text-muted">
          {time}
        </span>
      </div>
      {children}
    </section>
  );
}

export default function IeltsDayPage() {
  const params = useParams();
  const router = useRouter();
  const hydrated = useHydrated();
  const challengeId = String(params.id);
  const dayNumber = Math.min(
    Math.max(parseInt(String(params.day), 10) || 1, 1),
    IELTS_TOTAL_DAYS
  );
  const { ieltsChallenges, ieltsDays, saveIeltsDay } = useVault();

  const challenge = ieltsChallenges.find((c) => c.id === challengeId);
  const stored = ieltsDays.find(
    (d) => d.challengeId === challengeId && d.dayNumber === dayNumber
  );

  const [day, setDay] = React.useState<IeltsDay>(() =>
    emptyIeltsDay(challengeId, dayNumber)
  );
  const [seeded, setSeeded] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [savedFlash, setSavedFlash] = React.useState(false);

  // re-seed when navigating to a different day (the component instance is reused)
  React.useEffect(() => {
    setSeeded(false);
  }, [challengeId, dayNumber]);

  // seed local state once data is available (stored day or smart defaults)
  React.useEffect(() => {
    if (!hydrated || seeded || !challenge) return;
    if (stored) setDay(stored);
    else {
      const blank = emptyIeltsDay(challengeId, dayNumber);
      blank.date = suggestedDate(challenge, dayNumber);
      setDay(blank);
    }
    setSeeded(true);
  }, [hydrated, seeded, stored, challenge, challengeId, dayNumber]);

  if (!hydrated) return <div className="skeleton h-screen rounded-2xl" />;

  if (!challenge) {
    return (
      <div className="py-20 text-center">
        <p className="text-[15px] font-medium text-ink">Challenge not found</p>
        <Link href="/ielts">
          <Button variant="secondary" className="mt-4">
            Back to Challenges
          </Button>
        </Link>
      </div>
    );
  }

  const patch = (p: Partial<IeltsDay>) => setDay((d) => ({ ...d, ...p }));
  const complete = isDayComplete(day);
  const dow = day.date
    ? new Date(day.date + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long",
      })
    : "";

  const save = async () => {
    if (saving) return;
    setSaving(true);
    const ok = await saveIeltsDay(day);
    setSaving(false);
    if (ok) {
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1800);
    }
  };

  return (
    <div className="animate-fade-in space-y-5 pb-10">
      {/* Sticky header */}
      <div className="sticky top-16 z-10 -mx-4 flex items-center justify-between border-b border-line bg-canvas/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <button
          onClick={() => router.push(`/ielts/${challengeId}`)}
          className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-muted transition-colors hover:text-ink"
        >
          <ChevronLeft size={16} />
          {challenge.serial}
        </button>
        <div className="flex items-center gap-2">
          {dayNumber > 1 && (
            <Link href={`/ielts/${challengeId}/day/${dayNumber - 1}`}>
              <Button variant="ghost" size="sm">
                <ChevronLeft size={14} />
                Day {dayNumber - 1}
              </Button>
            </Link>
          )}
          {dayNumber < IELTS_TOTAL_DAYS && (
            <Link href={`/ielts/${challengeId}/day/${dayNumber + 1}`}>
              <Button variant="ghost" size="sm">
                Day {dayNumber + 1}
                <ChevronRight size={14} />
              </Button>
            </Link>
          )}
          <Button className="ws-accent-bg" onClick={save} disabled={saving}>
            <Save size={15} />
            {saving ? "Saving…" : savedFlash ? "Saved ✓" : "Save Day"}
          </Button>
        </div>
      </div>

      {/* Day header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-wider text-muted">
            30-Day IELTS Comeback Challenge
          </div>
          <h1 className="mt-1 text-[30px] font-semibold tracking-tighter text-ink">
            Day {String(dayNumber).padStart(2, "0")}
            {complete && (
              <CheckCircle2
                size={22}
                className="ws-accent-text ml-2 inline-block"
              />
            )}
          </h1>
        </div>
        <div className="flex items-end gap-3">
          <Field label="Date">
            <Input
              type="date"
              value={day.date}
              onChange={(e) => patch({ date: e.target.value })}
              className="w-44"
            />
          </Field>
          <div className="pb-2.5 text-[13px] text-muted">{dow}</div>
        </div>
      </div>

      {/* PART 1: LISTENING */}
      <SectionCard icon={Headphones} part="Part 1" title="Listening" time="30–40 min">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Test Source">
            <Input
              value={day.listening.source}
              onChange={(e) =>
                patch({ listening: { ...day.listening, source: e.target.value } })
              }
              placeholder="Cambridge 18 Test 2"
            />
          </Field>
          <Field label="Score ( /40 )">
            <Input
              value={day.listening.score}
              onChange={(e) =>
                patch({ listening: { ...day.listening, score: e.target.value } })
              }
              placeholder="31"
            />
          </Field>
          <Field label="Wrong">
            <Input
              value={day.listening.wrong}
              onChange={(e) =>
                patch({ listening: { ...day.listening, wrong: e.target.value } })
              }
              placeholder="9"
            />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Analyse Error Types">
            <CheckGroup
              options={LISTENING_ERROR_TYPES}
              value={day.listening.errorTypes}
              onChange={(v) =>
                patch({ listening: { ...day.listening, errorTypes: v } })
              }
            />
          </Field>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Questions Wrong (list Q numbers)">
            <Input
              value={day.listening.wrongQuestions}
              onChange={(e) =>
                patch({
                  listening: { ...day.listening, wrongQuestions: e.target.value },
                })
              }
              placeholder="7, 14, 23…"
            />
          </Field>
          <Field
            label="Today's Listening Lesson"
            hint="One concrete lesson — 'practise more' is NOT a lesson."
          >
            <Textarea
              rows={2}
              value={day.listening.lesson}
              onChange={(e) =>
                patch({ listening: { ...day.listening, lesson: e.target.value } })
              }
              placeholder="I mishear numbers when pace is fast — shadow BBC podcast."
            />
          </Field>
        </div>
      </SectionCard>

      {/* PART 2: READING */}
      <SectionCard icon={BookOpenText} part="Part 2" title="Reading" time="30–40 min">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Test Source">
            <Input
              value={day.reading.source}
              onChange={(e) =>
                patch({ reading: { ...day.reading, source: e.target.value } })
              }
              placeholder="Cambridge 17 Test 1"
            />
          </Field>
          <Field label="Score ( /40 )">
            <Input
              value={day.reading.score}
              onChange={(e) =>
                patch({ reading: { ...day.reading, score: e.target.value } })
              }
              placeholder="33"
            />
          </Field>
          <Field label="Wrong">
            <Input
              value={day.reading.wrong}
              onChange={(e) =>
                patch({ reading: { ...day.reading, wrong: e.target.value } })
              }
              placeholder="7"
            />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Question Types Missed">
            <CheckGroup
              options={READING_MISSED_TYPES}
              value={day.reading.missedTypes}
              onChange={(v) => patch({ reading: { ...day.reading, missedTypes: v } })}
            />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Today's Reading Lesson">
            <Textarea
              rows={2}
              value={day.reading.lesson}
              onChange={(e) =>
                patch({ reading: { ...day.reading, lesson: e.target.value } })
              }
            />
          </Field>
        </div>
      </SectionCard>

      {/* PART 3: WRITING */}
      <SectionCard icon={PenLine} part="Part 3" title="Writing" time="40 min">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Task Type" hint="Auto-rotates: odd days Task 1, even days Task 2.">
            <div className="ws-tint rounded-xl bg-surface px-3.5 py-2.5 text-[13.5px] font-medium text-ink">
              {writingTaskLabel(dayNumber)}
            </div>
          </Field>
          <Field label="Est. Band">
            <Input
              value={day.writing.estBand}
              onChange={(e) =>
                patch({ writing: { ...day.writing, estBand: e.target.value } })
              }
              placeholder="6.5"
            />
          </Field>
          <Field label="New Vocabulary Used in Essay">
            <Input
              value={day.writing.vocabUsed}
              onChange={(e) =>
                patch({ writing: { ...day.writing, vocabUsed: e.target.value } })
              }
              placeholder="mitigate, prevalent…"
            />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Analyse">
            <CheckGroup
              options={WRITING_ANALYSE}
              value={day.writing.analyse}
              onChange={(v) => patch({ writing: { ...day.writing, analyse: v } })}
            />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Today's Writing Lesson">
            <Textarea
              rows={2}
              value={day.writing.lesson}
              onChange={(e) =>
                patch({ writing: { ...day.writing, lesson: e.target.value } })
              }
            />
          </Field>
        </div>
      </SectionCard>

      {/* PART 4: SPEAKING */}
      <SectionCard icon={Mic} part="Part 4" title="Speaking" time="30 min">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Test Source (Makkar)">
            <Input
              value={day.speaking.source}
              onChange={(e) =>
                patch({ speaking: { ...day.speaking, source: e.target.value } })
              }
              placeholder="Makkar Jan–Apr"
            />
          </Field>
          <Field label="Test 1 Topic">
            <Input
              value={day.speaking.topic1}
              onChange={(e) =>
                patch({ speaking: { ...day.speaking, topic1: e.target.value } })
              }
            />
          </Field>
          <Field label="Test 2 Topic">
            <Input
              value={day.speaking.topic2}
              onChange={(e) =>
                patch({ speaking: { ...day.speaking, topic2: e.target.value } })
              }
            />
          </Field>
        </div>
        <div className="mt-4">
          <Field
            label="Identify From Recording"
            hint="Record yourself, play it back, tick what you hear."
          >
            <CheckGroup
              options={SPEAKING_IDENTIFY}
              value={day.speaking.identified}
              onChange={(v) =>
                patch({ speaking: { ...day.speaking, identified: v } })
              }
            />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Today's Speaking Lesson">
            <Textarea
              rows={2}
              value={day.speaking.lesson}
              onChange={(e) =>
                patch({ speaking: { ...day.speaking, lesson: e.target.value } })
              }
            />
          </Field>
        </div>
      </SectionCard>

      {/* PART 5: VOCABULARY */}
      <SectionCard icon={BookMarked} part="Part 5" title="Vocabulary" time="15 min">
        <div className="space-y-4">
          {day.vocabulary.map((v, i) => (
            <div key={i} className="grid gap-3 sm:grid-cols-[1fr_1.2fr_1.6fr]">
              <Field label={`Word ${i + 1}`}>
                <Input
                  value={v.word}
                  onChange={(e) => {
                    const vocab = [...day.vocabulary];
                    vocab[i] = { ...vocab[i], word: e.target.value };
                    patch({ vocabulary: vocab });
                  }}
                />
              </Field>
              <Field label="Meaning">
                <Input
                  value={v.meaning}
                  onChange={(e) => {
                    const vocab = [...day.vocabulary];
                    vocab[i] = { ...vocab[i], meaning: e.target.value };
                    patch({ vocabulary: vocab });
                  }}
                />
              </Field>
              <Field label="Example">
                <Input
                  value={v.example}
                  onChange={(e) => {
                    const vocab = [...day.vocabulary];
                    vocab[i] = { ...vocab[i], example: e.target.value };
                    patch({ vocabulary: vocab });
                  }}
                />
              </Field>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* PART 6: REFLECTION */}
      <SectionCard icon={Sparkles} part="Part 6" title="Daily Reflection" time="10 min">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Best Module">
            <Input
              value={day.reflection.bestModule}
              onChange={(e) =>
                patch({
                  reflection: { ...day.reflection, bestModule: e.target.value },
                })
              }
              placeholder="Reading"
            />
          </Field>
          <Field label="Weakest Module">
            <Input
              value={day.reflection.weakestModule}
              onChange={(e) =>
                patch({
                  reflection: { ...day.reflection, weakestModule: e.target.value },
                })
              }
              placeholder="Writing"
            />
          </Field>
          <Field label="Most Common Mistake">
            <Input
              value={day.reflection.commonMistake}
              onChange={(e) =>
                patch({
                  reflection: { ...day.reflection, commonMistake: e.target.value },
                })
              }
            />
          </Field>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="What Did I Learn Today?">
            <Textarea
              rows={2}
              value={day.reflection.learned}
              onChange={(e) =>
                patch({ reflection: { ...day.reflection, learned: e.target.value } })
              }
            />
          </Field>
          <Field label="What Will I Improve Tomorrow?">
            <Textarea
              rows={2}
              value={day.reflection.improve}
              onChange={(e) =>
                patch({ reflection: { ...day.reflection, improve: e.target.value } })
              }
            />
          </Field>
        </div>
      </SectionCard>

      {/* SUCCESS RULE */}
      <section
        className={cn(
          "card p-6 transition-colors",
          complete && "ws-tint border-transparent"
        )}
      >
        <h2 className="text-[15px] font-semibold tracking-tight text-ink">
          Success Rule — day is complete only when:
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {SUCCESS_RULE.map(({ key, label }) => {
            const on = day.done[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => patch({ done: { ...day.done, [key]: !on } })}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[13.5px] font-medium transition-all",
                  on
                    ? "ws-accent-bg border-transparent bg-ink text-white"
                    : "border-line bg-canvas text-muted hover:border-ink/20 hover:text-ink"
                )}
                aria-pressed={on}
              >
                <CheckCircle2 size={15} />
                {label}
              </button>
            );
          })}
        </div>
        {complete && (
          <p className="ws-accent-text mt-3 text-[13px] font-medium">
            Day {dayNumber} complete — no module skipped, no day wasted. 🎯
          </p>
        )}
        <div className="mt-5">
          <Button className="ws-accent-bg" onClick={save} disabled={saving}>
            <Save size={15} />
            {saving ? "Saving…" : savedFlash ? "Saved ✓" : "Save Day"}
          </Button>
        </div>
      </section>
    </div>
  );
}
