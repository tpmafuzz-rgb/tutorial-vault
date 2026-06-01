"use client";

import { NoteForm } from "@/components/note/NoteForm";

export default function NewNotePage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-2">
        <h1 className="text-[26px] font-semibold tracking-tighter text-ink">
          New Note
        </h1>
        <p className="mt-1 text-[14px] text-muted">
          Write freely, then label each section your own way.
        </p>
      </div>
      <NoteForm mode="create" />
    </div>
  );
}
