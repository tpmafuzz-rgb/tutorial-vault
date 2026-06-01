"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Pencil, Trash2 } from "lucide-react";
import { useVault } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { NoteFavoriteButton } from "@/components/note/NoteFavoriteButton";
import { NoteTOC } from "@/components/note/NoteTOC";
import { RichContent } from "@/components/tutorial/RichContent";

export default function NoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const hydrated = useHydrated();
  const id = String(params.id);
  const { notes, deleteNote } = useVault();
  const [confirmDel, setConfirmDel] = React.useState(false);

  const note = notes.find((n) => n.id === id);

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

  const remove = () => {
    deleteNote(note.id);
    router.push("/notes");
  };

  const labeled = note.blocks.filter((b) => b.label.trim() || b.content.trim());

  return (
    <div className="animate-fade-in pb-10">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-muted transition-colors hover:text-ink"
        >
          <ChevronLeft size={16} />
          Back
        </button>
        <div className="flex items-center gap-2">
          <Link href={`/notes/${note.id}/edit`}>
            <Button variant="secondary" size="sm">
              <Pencil size={14} />
              Edit
            </Button>
          </Link>
          <Button variant="danger" size="sm" onClick={() => setConfirmDel(true)}>
            <Trash2 size={14} />
            Delete
          </Button>
        </div>
      </div>

      <div className="mb-7">
        <div className="flex items-center gap-2.5">
          <span className="rounded-md bg-surface px-2 py-0.5 font-mono text-[12px] font-medium text-muted">
            {note.serial}
          </span>
          <NoteFavoriteButton id={note.id} favorite={note.favorite} size={18} />
        </div>
        <h1 className="mt-3 text-[30px] font-semibold leading-tight tracking-tighter text-ink">
          {note.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          {note.subject && (
            <span className="ws-accent-text text-[13px] font-medium text-ink">
              {note.subject}
            </span>
          )}
          {note.level && (
            <span className="text-[12.5px] text-muted">{note.level}</span>
          )}
          <span className="text-[12.5px] text-muted">
            Updated {formatDate(note.updatedAt)}
          </span>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* TOC */}
        <aside className="lg:col-span-1">
          <div className="card sticky top-24 p-5">
            <NoteTOC blocks={note.blocks} />
          </div>
        </aside>

        {/* Sections */}
        <div className="space-y-5 lg:col-span-2">
          {labeled.map((b) => (
            <section key={b.id} id={`sec-${b.id}`} className="card p-6 scroll-mt-24">
              {b.label.trim() && (
                <h2 className="ws-accent-text mb-3 text-[15px] font-semibold tracking-tight text-ink">
                  {b.label}
                </h2>
              )}
              <RichContent source={b.content} />
            </section>
          ))}
        </div>
      </div>

      <Modal
        open={confirmDel}
        onClose={() => setConfirmDel(false)}
        title="Delete this note?"
        description={`"${note.title}" will be permanently removed. This can't be undone.`}
      >
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmDel(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={remove}>
            <Trash2 size={14} />
            Delete Note
          </Button>
        </div>
      </Modal>
    </div>
  );
}
