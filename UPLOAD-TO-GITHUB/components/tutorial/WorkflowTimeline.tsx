import * as React from "react";
import type { WorkflowStep } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * The auto-generated visual workflow timeline — one of the most important
 * features. Horizontal stepped flow on desktop, vertical rail on mobile.
 */
export function WorkflowTimeline({
  steps,
  className,
}: {
  steps: WorkflowStep[];
  className?: string;
}) {
  if (!steps.length) return null;

  return (
    <div className={cn("w-full", className)}>
      {/* Desktop / tablet: horizontal */}
      <ol className="hidden items-stretch gap-0 md:flex">
        {steps.map((step, i) => (
          <li key={step.id} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-2.5 text-center">
              <div className="grid h-10 w-10 place-items-center rounded-full border border-line bg-canvas text-[13px] font-semibold text-ink shadow-subtle">
                {i + 1}
              </div>
              <span className="max-w-[96px] text-[12px] font-medium leading-tight text-muted">
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="mx-1 mb-6 h-px flex-1 bg-line" />
            )}
          </li>
        ))}
      </ol>

      {/* Mobile: vertical rail */}
      <ol className="relative space-y-0 md:hidden">
        {steps.map((step, i) => (
          <li key={step.id} className="relative flex gap-3 pb-5 last:pb-0">
            {i < steps.length - 1 && (
              <span className="absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-px bg-line" />
            )}
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-canvas text-[13px] font-semibold text-ink shadow-subtle">
              {i + 1}
            </div>
            <div className="flex min-h-10 items-center">
              <span className="text-[13.5px] font-medium text-ink">
                {step.label}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Compact preview used on cards. */
export function WorkflowTimelineMini({ steps }: { steps: WorkflowStep[] }) {
  const shown = steps.slice(0, 4);
  const extra = steps.length - shown.length;
  return (
    <div className="flex items-center gap-1.5">
      {shown.map((s, i) => (
        <React.Fragment key={s.id}>
          <span className="grid h-5 w-5 place-items-center rounded-full border border-line bg-surface text-[10px] font-semibold text-muted">
            {i + 1}
          </span>
          {i < shown.length - 1 && <span className="h-px w-2 bg-line" />}
        </React.Fragment>
      ))}
      {extra > 0 && <span className="ml-0.5 text-[11px] text-muted">+{extra}</span>}
    </div>
  );
}
