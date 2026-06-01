"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { useVault } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { TutorialCard } from "@/components/tutorial/TutorialCard";
import { NoteCard } from "@/components/note/NoteCard";
import { EmptyState } from "@/components/ui/EmptyState";

export default function FavoritesPage() {
  const hydrated = useHydrated();
  const { workspace, tutorials, notes } = useVault();
  const isAcademic = workspace === "academic";

  const favTutorials = tutorials.filter((t) => t.favorite);
  const favNotes = notes.filter((n) => n.favorite);
  const isEmpty = isAcademic ? favNotes.length === 0 : favTutorials.length === 0;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Favorites"
        subtitle={
          isAcademic
            ? "The notes you return to again and again."
            : "The techniques you reach for again and again."
        }
      />

      {!hydrated ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-44 rounded-2xl" />
          ))}
        </div>
      ) : isEmpty ? (
        <EmptyState
          icon={<Star size={20} />}
          title="No favorites yet"
          description={
            isAcademic
              ? "Star a note to keep it close. Your most-used notes will live here."
              : "Star a tutorial to keep it close. Your most-used techniques will live here."
          }
          action={
            <Link href={isAcademic ? "/notes" : "/tutorials"}>
              <Button variant="secondary">
                {isAcademic ? "Browse Notes" : "Browse Tutorials"}
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isAcademic
            ? favNotes.map((n) => <NoteCard key={n.id} note={n} />)
            : favTutorials.map((t) => <TutorialCard key={t.id} tutorial={t} />)}
        </div>
      )}
    </div>
  );
}
