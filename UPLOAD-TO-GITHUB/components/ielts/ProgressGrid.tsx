"use client";

import * as React from "react";
import Link from "next/link";
import type { IeltsDay } from "@/lib/types";
import { IELTS_TOTAL_DAYS, isDayComplete } from "@/lib/ielts";
import { cn } from "@/lib/utils";

/**
 * The live 30-Day Progress Grid — the digital twin of the printed grid, but
 * auto-filled from each day's Success Rule checkboxes. Each cell links to its
 * day sheet.
 */
export function ProgressGrid({
  challengeId,
  days,
}: {
  challengeId: string;
  days: IeltsDay[];
}) {
  const byNumber = new Map(days.map((d) => [d.dayNumber, d]));

  return (
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-10">
      {Array.from({ length: IELTS_TOTAL_DAYS }, (_, i) => i + 1).map((n) => {
        const day = byNumber.get(n);
        const complete = day ? isDayComplete(day) : false;
        const modules: { key: keyof IeltsDay["done"]; letter: string }[] = [
          { key: "listening", letter: "L" },
          { key: "reading", letter: "R" },
          { key: "writing", letter: "W" },
          { key: "speaking", letter: "S" },
        ];
        return (
          <Link
            key={n}
            href={`/ielts/${challengeId}/day/${n}`}
            className={cn(
              "group rounded-xl border p-2 text-center transition-all hover:-translate-y-0.5 hover:shadow-card",
              complete
                ? "ws-tint border-transparent"
                : "border-line bg-canvas hover:border-ink/15"
            )}
            title={`Day ${n}${complete ? " — complete" : ""}`}
          >
            <div
              className={cn(
                "text-[13px] font-semibold tabular-nums",
                complete ? "ws-accent-text" : "text-ink"
              )}
            >
              {n}
            </div>
            <div className="mt-1 flex items-center justify-center gap-0.5">
              {modules.map(({ key, letter }) => {
                const on = day?.done[key] ?? false;
                return (
                  <span
                    key={key}
                    className={cn(
                      "grid h-4 w-4 place-items-center rounded-[5px] text-[8.5px] font-bold",
                      on
                        ? "ws-accent-bg bg-ink text-white"
                        : "bg-surface text-muted/60"
                    )}
                  >
                    {letter}
                  </span>
                );
              })}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
