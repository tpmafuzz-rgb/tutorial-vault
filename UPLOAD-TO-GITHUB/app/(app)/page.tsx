"use client";

import Link from "next/link";
import {
  Library,
  FolderOpen,
  Tags,
  FileDown,
  Plus,
  Upload,
  FolderPlus,
  BookOpen,
  ArrowRight,
  NotebookPen,
  GraduationCap,
  Layers,
} from "lucide-react";
import { useVault } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import { StatCard } from "@/components/ui/StatCard";
import { TutorialCard } from "@/components/tutorial/TutorialCard";
import { NoteCard } from "@/components/note/NoteCard";
import { Button } from "@/components/ui/Button";

const EDITING_ACTIONS = [
  { href: "/tutorials/new", label: "New Tutorial", icon: Plus },
  { href: "/assets", label: "Upload Asset", icon: Upload },
  { href: "/categories", label: "Create Category", icon: FolderPlus },
  { href: "/export", label: "Export Book", icon: BookOpen },
];

const ACADEMIC_ACTIONS = [
  { href: "/notes/new", label: "New Note", icon: Plus },
  { href: "/notes", label: "All Notes", icon: NotebookPen },
  { href: "/favorites", label: "Favorites", icon: BookOpen },
  { href: "/export", label: "Export Book", icon: BookOpen },
];

export default function DashboardPage() {
  const hydrated = useHydrated();
  const {
    workspace,
    tutorials,
    assets,
    categories,
    notes,
    pdfExports,
    profile,
  } = useVault();

  const isAcademic = workspace === "academic";
  const actions = isAcademic ? ACADEMIC_ACTIONS : EDITING_ACTIONS;

  const recentTutorials = [...tutorials]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);
  const recentNotes = [...notes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  const subjects = new Set(notes.map((n) => n.subject.trim()).filter(Boolean));

  return (
    <div className="animate-fade-in">
      <div className="mb-7">
        <p className="text-[13px] font-medium text-muted">
          Welcome back{hydrated ? `, ${profile.authorName.split(" ")[0]}` : ""}
        </p>
        <h1 className="mt-0.5 text-[27px] font-semibold tracking-tighter text-ink">
          {isAcademic ? "Your study notebook" : "Your editing encyclopedia"}
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isAcademic ? (
          <>
            <StatCard
              label="Total Notes"
              value={hydrated ? notes.length : "—"}
              icon={<NotebookPen size={16} />}
              hint="notes saved"
            />
            <StatCard
              label="Subjects"
              value={hydrated ? subjects.size : "—"}
              icon={<GraduationCap size={16} />}
              hint="areas of study"
            />
            <StatCard
              label="Favorites"
              value={hydrated ? notes.filter((n) => n.favorite).length : "—"}
              icon={<BookOpen size={16} />}
              hint="starred notes"
            />
            <StatCard
              label="PDFs Exported"
              value={hydrated ? pdfExports : "—"}
              icon={<FileDown size={16} />}
              hint="books generated"
            />
          </>
        ) : (
          <>
            <StatCard
              label="Total Tutorials"
              value={hydrated ? tutorials.length : "—"}
              icon={<Library size={16} />}
              hint="techniques saved"
            />
            <StatCard
              label="Total Assets"
              value={hydrated ? assets.length : "—"}
              icon={<FolderOpen size={16} />}
              hint="in your library"
            />
            <StatCard
              label="Categories"
              value={hydrated ? categories.length : "—"}
              icon={<Tags size={16} />}
              hint="ways to organize"
            />
            <StatCard
              label="PDFs Exported"
              value={hydrated ? pdfExports : "—"}
              icon={<FileDown size={16} />}
              hint="books generated"
            />
          </>
        )}
      </div>

      {/* Quick actions */}
      <div className="mt-7">
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-muted">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {actions.map(({ href, label, icon: Icon }) => (
            <Link
              key={href + label}
              href={href}
              className="group flex items-center gap-3 rounded-2xl border border-line bg-canvas p-4 transition-all hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-card"
            >
              <span className="ws-accent-bg grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink text-white transition-transform group-hover:scale-105">
                <Icon size={18} strokeWidth={2.2} />
              </span>
              <span className="text-[13.5px] font-medium text-ink">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent */}
      <div className="mt-9">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[16px] font-semibold tracking-tight text-ink">
            {isAcademic ? "Recent Notes" : "Recent Tutorials"}
          </h2>
          <Link href={isAcademic ? "/notes" : "/tutorials"}>
            <Button variant="ghost" size="sm">
              View all
              <ArrowRight size={14} />
            </Button>
          </Link>
        </div>

        {!hydrated ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-44 rounded-2xl" />
            ))}
          </div>
        ) : isAcademic ? (
          recentNotes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-surface/50 px-6 py-12 text-center">
              <Layers size={20} className="mx-auto mb-3 text-muted" />
              <p className="text-[14px] font-medium text-ink">No notes yet</p>
              <p className="mt-1 text-[13px] text-muted">
                Create your first academic note to get started.
              </p>
              <Link href="/notes/new" className="mt-4 inline-block">
                <Button className="ws-accent-bg">
                  <Plus size={16} />
                  New Note
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentNotes.map((n) => (
                <NoteCard key={n.id} note={n} />
              ))}
            </div>
          )
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentTutorials.map((t) => (
              <TutorialCard key={t.id} tutorial={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
