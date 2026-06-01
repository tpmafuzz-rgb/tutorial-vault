"use client";

import Link from "next/link";
import type { Note } from "@/lib/types";
import { relativeDate } from "@/lib/utils";
import { NoteFavoriteButton } from "./NoteFavoriteButton";
import { NoteTOCMini } from "./NoteTOC";

export function NoteCard({ note }: { note: Note }) {
  const preview =
    note.blocks.find((b) => b.content.trim())?.content.trim().slice(0, 120) ?? "";

  return (
    <Link
      href={`/notes/${note.id}`}
      className="group flex flex-col rounded-2xl border border-line bg-canvas p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-card"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-md bg-surface px-2 py-0.5 font-mono text-[11px] font-medium text-muted">
          {note.serial}
        </span>
        <NoteFavoriteButton id={note.id} favorite={note.favorite} />
      </div>

      <h3 className="mt-3 line-clamp-2 text-[15.5px] font-semibold leading-snug tracking-tight text-ink">
        {note.title}
      </h3>
      {preview && (
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted">
          {preview}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        {note.subject && (
          <span className="ws-accent-text inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink">
            {note.subject}
          </span>
        )}
        {note.level && (
          <span className="text-[12.5px] text-muted">{note.level}</span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-3.5">
        <NoteTOCMini blocks={note.blocks} />
        <span className="text-[11.5px] text-muted">
          {relativeDate(note.updatedAt)}
        </span>
      </div>
    </Link>
  );
}
