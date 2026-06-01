"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Search, NotebookPen } from "lucide-react";
import { useVault, searchNotes } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { NoteCard } from "@/components/note/NoteCard";
import { EmptyState } from "@/components/ui/EmptyState";

export default function NotesPage() {
  const hydrated = useHydrated();
  const notes = useVault((s) => s.notes);
  const [q, setQ] = React.useState("");
  const [subject, setSubject] = React.useState("all");

  const subjects = React.useMemo(() => {
    const s = new Set<string>();
    notes.forEach((n) => n.subject.trim() && s.add(n.subject.trim()));
    return [...s].sort();
  }, [notes]);

  const filtered = React.useMemo(() => {
    let list = searchNotes(notes, q);
    if (subject !== "all") list = list.filter((n) => n.subject === subject);
    return list;
  }, [notes, q, subject]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Notes"
        subtitle="Your academic vault — write freely, label sections, study later."
        actions={
          <Link href="/notes/new">
            <Button className="ws-accent-bg">
              <Plus size={16} strokeWidth={2.4} />
              New Note
            </Button>
          </Link>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[200px] flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter notes…"
            className="input-base pl-10"
          />
        </div>
        {subjects.length > 0 && (
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="input-base w-auto cursor-pointer"
          >
            <option value="all">All subjects</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
      </div>

      {!hydrated ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-44 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<NotebookPen size={20} />}
          title={notes.length === 0 ? "No notes yet" : "No matches"}
          description={
            notes.length === 0
              ? "Create your first academic note — a blank canvas you organize your own way."
              : "Try a different search or subject filter."
          }
          action={
            notes.length === 0 ? (
              <Link href="/notes/new">
                <Button className="ws-accent-bg">
                  <Plus size={16} />
                  New Note
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((n) => (
            <NoteCard key={n.id} note={n} />
          ))}
        </div>
      )}
    </div>
  );
}
