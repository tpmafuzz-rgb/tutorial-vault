import * as React from "react";
import { List } from "lucide-react";
import type { NoteBlock } from "@/lib/types";

/**
 * Auto Table of Contents for an academic note — built from the labeled blocks.
 * The academic counterpart to the editing Workflow Timeline.
 */
export function NoteTOC({ blocks }: { blocks: NoteBlock[] }) {
  const labeled = blocks.filter((b) => b.label.trim());
  if (labeled.length === 0) return null;

  return (
    <div>
      <div className="mb-3 flex items-center gap-2.5">
        <span className="ws-accent-bg grid h-7 w-7 place-items-center rounded-lg bg-ink text-white">
          <List size={14} />
        </span>
        <h2 className="text-[15px] font-semibold tracking-tight text-ink">
          Contents
        </h2>
      </div>
      <ol className="space-y-1.5">
        {labeled.map((b, i) => (
          <li key={b.id} className="flex items-center gap-3 text-[13.5px]">
            <span className="ws-tint grid h-5 w-5 shrink-0 place-items-center rounded-md bg-surface text-[11px] font-semibold text-muted">
              {i + 1}
            </span>
            <a
              href={`#sec-${b.id}`}
              className="ws-accent-text text-ink/90 hover:underline"
            >
              {b.label}
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Compact preview used on note cards. */
export function NoteTOCMini({ blocks }: { blocks: NoteBlock[] }) {
  const labels = blocks.filter((b) => b.label.trim()).map((b) => b.label);
  const shown = labels.slice(0, 3);
  const extra = labels.length - shown.length;
  if (labels.length === 0)
    return <span className="text-[11.5px] text-muted">No sections yet</span>;
  return (
    <div className="flex flex-wrap items-center gap-1">
      {shown.map((l, i) => (
        <span
          key={i}
          className="rounded-md bg-surface px-1.5 py-0.5 text-[10.5px] font-medium text-muted"
        >
          {l}
        </span>
      ))}
      {extra > 0 && <span className="text-[11px] text-muted">+{extra}</span>}
    </div>
  );
}
