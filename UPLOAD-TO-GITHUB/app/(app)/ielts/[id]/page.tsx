"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Flame,
  CalendarCheck,
  TrendingUp,
  BookOpen,
  BookMarked,
  ArrowRight,
} from "lucide-react";
import { useVault } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import { formatDate } from "@/lib/utils";
import {
  collectVocabulary,
  completedCount,
  currentStreak,
  dayHasData,
  IELTS_TOTAL_DAYS,
  isDayComplete,
} from "@/lib/ielts";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { ProgressGrid } from "@/components/ielts/ProgressGrid";
import { BandTrend } from "@/components/ielts/BandTrend";

export default function IeltsChallengePage() {
  const params = useParams();
  const router = useRouter();
  const hydrated = useHydrated();
  const id = String(params.id);
  const { ieltsChallenges, ieltsDays } = useVault();

  const challenge = ieltsChallenges.find((c) => c.id === id);
  const days = ieltsDays.filter((d) => d.challengeId === id);

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

  const done = completedCount(days);
  const streak = currentStreak(days);
  const vocab = collectVocabulary(days);
  // next day to work on: first day without complete status
  const byNumber = new Map(days.map((d) => [d.dayNumber, d]));
  let nextDay = 1;
  for (let n = 1; n <= IELTS_TOTAL_DAYS; n++) {
    const d = byNumber.get(n);
    if (!d || !isDayComplete(d)) {
      nextDay = n;
      break;
    }
    if (n === IELTS_TOTAL_DAYS) nextDay = IELTS_TOTAL_DAYS;
  }
  const started = days.filter(dayHasData).length;

  return (
    <div className="animate-fade-in pb-10">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.push("/ielts")}
          className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-muted transition-colors hover:text-ink"
        >
          <ChevronLeft size={16} />
          All Challenges
        </button>
        <div className="flex items-center gap-2">
          <Link href="/export">
            <Button variant="secondary" size="sm">
              <BookOpen size={14} />
              Export Book
            </Button>
          </Link>
          <Link href={`/ielts/${id}/day/${nextDay}`}>
            <Button size="sm" className="ws-accent-bg">
              Continue Day {nextDay}
              <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-7">
        <div className="flex items-center gap-2.5">
          <span className="rounded-md bg-surface px-2 py-0.5 font-mono text-[12px] font-medium text-muted">
            {challenge.serial}
          </span>
          <span className="ws-tint ws-accent-text rounded-md px-2 py-0.5 text-[11.5px] font-semibold uppercase">
            {challenge.status}
          </span>
        </div>
        <h1 className="mt-3 text-[28px] font-semibold leading-tight tracking-tighter text-ink">
          30-Day IELTS Comeback Challenge
        </h1>
        <p className="mt-1.5 text-[13.5px] text-muted">
          {challenge.studentName && <>{challenge.studentName} · </>}
          {challenge.targetBand && <>Target Band {challenge.targetBand} · </>}
          {challenge.startDate && <>Started {formatDate(challenge.startDate)}</>}
          {challenge.targetDate && <> · Exam {formatDate(challenge.targetDate)}</>}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Days Complete"
          value={`${done}/${IELTS_TOTAL_DAYS}`}
          icon={<CalendarCheck size={16} />}
          hint="all 5 boxes ticked"
        />
        <StatCard
          label="Current Streak"
          value={streak}
          icon={<Flame size={16} />}
          hint="consecutive complete days"
        />
        <StatCard
          label="Days Started"
          value={started}
          icon={<TrendingUp size={16} />}
          hint="have any entry"
        />
        <StatCard
          label="Vocabulary Bank"
          value={vocab.length}
          icon={<BookMarked size={16} />}
          hint="words collected"
        />
      </div>

      {/* Progress grid */}
      <div className="card mt-6 p-6">
        <h2 className="mb-4 text-[15px] font-semibold tracking-tight text-ink">
          30-Day Progress Grid
        </h2>
        <ProgressGrid challengeId={id} days={days} />
        <p className="mt-3 text-[12px] text-muted">
          Click any day to open its tracker sheet. A day lights up when all five
          Success Rule boxes are ticked — each incomplete day resets the streak.
        </p>
      </div>

      {/* Band trend */}
      <div className="card mt-5 p-6">
        <h2 className="mb-4 text-[15px] font-semibold tracking-tight text-ink">
          Band Trend
        </h2>
        <BandTrend days={days} targetBand={challenge.targetBand} />
      </div>

      {/* Vocabulary bank */}
      <div className="card mt-5 p-6">
        <h2 className="mb-1 text-[15px] font-semibold tracking-tight text-ink">
          Vocabulary Bank
        </h2>
        <p className="mb-4 text-[12.5px] text-muted">
          Every word you record on a day sheet collects here — review before
          writing today&apos;s five.
        </p>
        {vocab.length === 0 ? (
          <p className="text-[13px] italic text-muted">
            No words yet. Add 5 new words on each day sheet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-line text-[11.5px] uppercase tracking-wide text-muted">
                  <th className="py-2 pr-3 font-medium">Day</th>
                  <th className="py-2 pr-3 font-medium">Word</th>
                  <th className="py-2 pr-3 font-medium">Meaning</th>
                  <th className="py-2 font-medium">Example</th>
                </tr>
              </thead>
              <tbody>
                {vocab.map((v, i) => (
                  <tr key={i} className="border-b border-line/60 align-top">
                    <td className="py-2 pr-3 font-mono text-[11.5px] text-muted">
                      D{v.dayNumber}
                    </td>
                    <td className="py-2 pr-3 font-medium text-ink">{v.word}</td>
                    <td className="py-2 pr-3 text-ink/80">{v.meaning}</td>
                    <td className="py-2 text-muted">{v.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
