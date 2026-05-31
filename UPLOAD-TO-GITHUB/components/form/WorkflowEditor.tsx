"use client";

import * as React from "react";
import { Plus, X, Wand2 } from "lucide-react";
import type { WorkflowStep } from "@/lib/types";
import { uid } from "@/lib/utils";

export function WorkflowEditor({
  value,
  onChange,
  onAutoGenerate,
}: {
  value: WorkflowStep[];
  onChange: (next: WorkflowStep[]) => void;
  onAutoGenerate: () => void;
}) {
  const [draft, setDraft] = React.useState("");

  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...value, { id: uid("w"), label: v }]);
    setDraft("");
  };

  const update = (id: string, label: string) =>
    onChange(value.map((s) => (s.id === id ? { ...s, label } : s)));

  const remove = (id: string) => onChange(value.filter((s) => s.id !== id));

  return (
    <div className="rounded-2xl border border-line bg-surface/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="field-hint">The visual timeline shown on the tutorial page.</p>
        <button
          type="button"
          onClick={onAutoGenerate}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-canvas px-2.5 py-1.5 text-[12.5px] font-medium text-ink transition-colors hover:bg-surface"
        >
          <Wand2 size={14} />
          Auto-generate
        </button>
      </div>

      <div className="space-y-2">
        {value.map((step, i) => (
          <div
            key={step.id}
            className="group flex items-center gap-2.5 rounded-xl border border-line bg-canvas px-3 py-1.5"
          >
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface text-[11px] font-semibold text-muted">
              {i + 1}
            </span>
            <input
              value={step.label}
              onChange={(e) => update(step.id, e.target.value)}
              className="flex-1 bg-transparent text-[13.5px] outline-none"
            />
            <button
              type="button"
              onClick={() => remove(step.id)}
              className="text-muted/50 opacity-0 transition-all hover:text-rose-500 group-hover:opacity-100"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Add a workflow step…"
          className="input-base flex-1 py-2"
        />
        <button
          type="button"
          onClick={add}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-canvas text-muted transition-colors hover:bg-surface hover:text-ink"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
