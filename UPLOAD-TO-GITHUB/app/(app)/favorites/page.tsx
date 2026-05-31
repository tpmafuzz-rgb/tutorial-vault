"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { useVault } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { TutorialCard } from "@/components/tutorial/TutorialCard";
import { EmptyState } from "@/components/ui/EmptyState";

export default function FavoritesPage() {
  const hydrated = useHydrated();
  const tutorials = useVault((s) => s.tutorials);
  const favorites = tutorials.filter((t) => t.favorite);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Favorites"
        subtitle="The techniques you reach for again and again."
      />

      {!hydrated ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-48 rounded-2xl" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <EmptyState
          icon={<Star size={20} />}
          title="No favorites yet"
          description="Star a tutorial to keep it close. Your most-used techniques will live here."
          action={
            <Link href="/tutorials">
              <Button variant="secondary">Browse Tutorials</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((t) => (
            <TutorialCard key={t.id} tutorial={t} />
          ))}
        </div>
      )}
    </div>
  );
}
