"use client";

import * as React from "react";
import { Plus, X, GripVertical } from "lucide-react";

export function ChecklistEditor({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = React.useState("");

  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...value, v]);
    setDraft("");
  };

  const update = (i: number, text: string) =>
    onChange(value.map((v, idx) => (idx === i ? text : v)));

  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      {value.map((item, i) => (
        <div
          key={i}
          className="group flex items-center gap-2 rounded-xl border border-line bg-canvas px-2.5 py-1.5"
        >
          <GripVertical size={15} className="shrink-0 text-muted/40" />
          <span className="grid h-4 w-4 shrink-0 place-items-center rounded-[5px] border border-line" />
          <input
            value={item}
            onChange={(e) => update(i, e.target.value)}
            className="flex-1 bg-transparent text-[13.5px] outline-none"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="text-muted/50 opacity-0 transition-all hover:text-rose-500 group-hover:opacity-100"
          >
            <X size={15} />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Add a checklist item…"
          className="input-base flex-1 py-2"
        />
        <button
          type="button"
          onClick={add}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line text-muted transition-colors hover:bg-surface hover:text-ink"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
