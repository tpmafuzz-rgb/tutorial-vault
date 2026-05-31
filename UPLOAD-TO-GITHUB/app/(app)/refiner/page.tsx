"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Wand2, ArrowRight, RotateCcw, FileText } from "lucide-react";
import { refineTutorial, type RefinedTutorial } from "@/lib/refiner";
import type { TutorialFormValues } from "@/lib/schema";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { WorkflowTimeline } from "@/components/tutorial/WorkflowTimeline";
import { RichContent } from "@/components/tutorial/RichContent";

const SAMPLE = `How to color grade for a cinematic teal and orange look in Premiere Pro.
First balance your exposure and white balance before doing anything creative.
Then apply a teal and orange LUT but keep it around 70 percent, don't push it to 100 because it looks overcooked.
Push the shadows toward teal and highlights toward orange with the color wheels.
Protect skin tones with a hue vs sat curve.
Add some 35mm film grain on a screen blend at low opacity.
Common mistake: people grade before balancing exposure.
If you see banding in the sky, add subtle grain or a tiny blur.
Shortcut: reset an effect by clicking the reset icon. Export when you're done.`;

export default function RefinerPage() {
  const router = useRouter();
  const [raw, setRaw] = React.useState("");
  const [draft, setDraft] = React.useState<RefinedTutorial | null>(null);
  const [busy, setBusy] = React.useState(false);

  const run = () => {
    if (!raw.trim()) return;
    setBusy(true);
    // Local deterministic refiner (mock mode). In Supabase mode this becomes
    // a POST to /api/refine that calls Claude and falls back to this.
    setTimeout(() => {
      setDraft(refineTutorial(raw));
      setBusy(false);
    }, 450);
  };

  const useDraft = () => {
    if (!draft) return;
    const values: Partial<TutorialFormValues> = {
      name: draft.name,
      goal: draft.goal,
      finalResult: draft.finalResult,
      software: draft.software,
      difficulty: draft.difficulty,
      categoryId: null,
      assetsRequired: [],
      beforeYouStart: draft.beforeYouStart,
      steps: draft.steps,
      commonMistakes: draft.commonMistakes,
      troubleshooting: draft.troubleshooting,
      keyboardShortcuts: draft.keyboardShortcuts,
      alternativeMethods: "",
      finalChecklist: draft.finalChecklist,
      workflow: draft.workflow,
      linkedAssetIds: [],
    };
    sessionStorage.setItem("tv-refiner-draft", JSON.stringify(values));
    router.push("/tutorials/new?from=refiner");
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="AI Refiner"
        subtitle="Paste a messy transcript or rough notes — get a clean, structured tutorial."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Raw input */}
        <div className="card flex flex-col p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink">
              <FileText size={15} className="text-muted" />
              Raw text
            </span>
            <button
              onClick={() => setRaw(SAMPLE)}
              className="text-[12px] font-medium text-muted transition-colors hover:text-ink"
            >
              Try a sample
            </button>
          </div>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="Paste a YouTube transcript, course notes, or your own messy notes here…"
            className="input-base min-h-[340px] flex-1 resize-y font-mono text-[13px] leading-relaxed"
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[12px] text-muted">
              {raw.trim() ? `${raw.trim().split(/\s+/).length} words` : "Local · private · no account needed"}
            </span>
            <Button onClick={run} disabled={!raw.trim() || busy}>
              <Wand2 size={15} />
              {busy ? "Refining…" : "Refine"}
            </Button>
          </div>
        </div>

        {/* Structured output */}
        <div className="card flex flex-col p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink">
              <Sparkles size={15} className="text-muted" />
              Structured tutorial
            </span>
            {draft && (
              <button
                onClick={() => setDraft(null)}
                className="inline-flex items-center gap-1 text-[12px] font-medium text-muted transition-colors hover:text-ink"
              >
                <RotateCcw size={13} />
                Clear
              </button>
            )}
          </div>

          {!draft ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-line bg-surface/40 px-6 py-16 text-center">
              <div className="mb-3 grid h-11 w-11 place-items-center rounded-2xl border border-line bg-canvas text-muted shadow-subtle">
                <Sparkles size={18} />
              </div>
              <p className="text-[14px] font-medium text-ink">
                Your structured draft appears here
              </p>
              <p className="mt-1 max-w-xs text-[13px] text-muted">
                Paste text on the left and hit Refine. You can review and edit
                everything before saving.
              </p>
            </div>
          ) : (
            <div className="flex flex-1 flex-col">
              <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                <div>
                  <h3 className="text-[16px] font-semibold tracking-tight text-ink">
                    {draft.name}
                  </h3>
                  <p className="mt-1 text-[13px] text-muted">{draft.goal}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-surface px-2 py-0.5 text-[12px] text-muted">
                    {draft.difficulty}
                  </span>
                  {draft.software.map((s) => (
                    <span
                      key={s}
                      className="rounded-md border border-line px-2 py-0.5 text-[12px] text-muted"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <div className="rounded-xl border border-line bg-surface/40 p-3">
                  <WorkflowTimeline steps={draft.workflow} />
                </div>

                <div>
                  <p className="mb-1 text-[12px] font-semibold uppercase tracking-wide text-muted">
                    Steps
                  </p>
                  <RichContent source={draft.steps} />
                </div>
              </div>

              <div className="mt-4 border-t border-line pt-3">
                <Button onClick={useDraft} className="w-full">
                  Use this draft
                  <ArrowRight size={15} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
