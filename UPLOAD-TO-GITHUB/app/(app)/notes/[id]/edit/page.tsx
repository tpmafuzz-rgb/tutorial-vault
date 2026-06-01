"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useVault } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import { NoteForm } from "@/components/note/NoteForm";
import { Button } from "@/components/ui/Button";
import type { NoteFormValues } from "@/lib/schema";

export default function EditNotePage() {
  const params = useParams();
  const hydrated = useHydrated();
  const id = String(params.id);
  const note = useVault((s) => s.notes.find((n) => n.id === id));

  if (!hydrated) return <div className="skeleton h-screen rounded-2xl" />;

  if (!note) {
    return (
      <div className="py-20 text-center">
        <p className="text-[15px] font-medium text-ink">Note not found</p>
        <Link href="/notes">
          <Button variant="secondary" className="mt-4">
            Back to Notes
          </Button>
        </Link>
      </div>
    );
  }

  const initial: Partial<NoteFormValues> = {
    title: note.title,
    subject: note.subject,
    level: note.level,
    blocks: note.blocks,
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-2">
        <h1 className="text-[26px] font-semibold tracking-tighter text-ink">
          Edit Note
        </h1>
        <p className="mt-1 text-[14px] text-muted">
          {note.serial} · {note.title}
        </p>
      </div>
      <NoteForm mode="edit" noteId={note.id} initial={initial} />
    </div>
  );
}
