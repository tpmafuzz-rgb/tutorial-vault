"use client";

import * as React from "react";
import { Plus, X, ArrowUp, ArrowDown, Tag } from "lucide-react";
import type { NoteBlock } from "@/lib/types";
import { uid } from "@/lib/utils";

/**
 * The academic note canvas: a list of labeled blocks. The user writes freely
 * in each block, then labels it ("Introduction", "Key Terms", ...). Past
 * labels are offered as quick-pick chips.
 */
export function NoteBlockEditor({
  value,
  onChange,
  labelSuggestions,
}: {
  value: NoteBlock[];
  onChange: (next: NoteBlock[]) => void;
  labelSuggestions: string[];
}) {
  const addBlock = () =>
    onChange([...value, { id: uid("b"), label: "", content: "" }]);

  const update = (id: string, patch: Partial<NoteBlock>) =>
    onChange(value.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const remove = (id: string) => onChange(value.filter((b) => b.id !== id));

  const move = (index: number, dir: -1 | 1) => {
    const next = [...value];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {value.map((block, i) => (
        <div
          key={block.id}
          className="group rounded-2xl border border-line bg-canvas p-4 transition-shadow hover:shadow-subtle"
        >
          <div className="mb-2.5 flex items-center gap-2">
            <Tag size={14} className="ws-accent-text shrink-0 text-muted" />
            <input
              value={block.label}
              onChange={(e) => update(block.id, { label: e.target.value })}
              placeholder="Label this section (e.g. Introduction)"
              className="flex-1 bg-transparent text-[13.5px] font-semibold text-ink outline-none placeholder:font-normal placeholder:text-muted/70"
            />
            <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-surface hover:text-ink disabled:opacity-30"
                aria-label="Move up"
              >
                <ArrowUp size={14} />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === value.length - 1}
                className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-surface hover:text-ink disabled:opacity-30"
                aria-label="Move down"
              >
                <ArrowDown size={14} />
              </button>
              <button
                type="button"
                onClick={() => remove(block.id)}
                className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-rose-50 hover:text-rose-500"
                aria-label="Delete section"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* quick-pick labels */}
          {!block.label && labelSuggestions.length > 0 && (
            <div className="mb-2.5 flex flex-wrap gap-1.5">
              {labelSuggestions.slice(0, 8).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => update(block.id, { label: s })}
                  className="rounded-lg border border-dashed border-line px-2 py-0.5 text-[11.5px] text-muted transition-colors hover:border-ink/30 hover:text-ink"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <textarea
            value={block.content}
            onChange={(e) => update(block.id, { content: e.target.value })}
            placeholder="Write this section…  (supports - bullets, 1. lists, ## sub-headings)"
            rows={5}
            className="input-base resize-y leading-relaxed"
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addBlock}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-surface/40 py-3.5 text-[13.5px] font-medium text-muted transition-colors hover:border-ink/30 hover:text-ink"
      >
        <Plus size={16} />
        Add a section
      </button>
    </div>
  );
}
