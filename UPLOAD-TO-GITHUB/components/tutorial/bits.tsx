"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { DIFFICULTY_META, cn } from "@/lib/utils";
import { useVault } from "@/lib/store";

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const meta = DIFFICULTY_META[difficulty] ?? DIFFICULTY_META.Beginner;
  return (
    <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-muted">
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}

export function FavoriteButton({
  id,
  favorite,
  size = 16,
}: {
  id: string;
  favorite: boolean;
  size?: number;
}) {
  const toggle = useVault((s) => s.toggleFavorite);
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
      className={cn(
        "grid place-items-center rounded-lg p-1.5 transition-all",
        favorite
          ? "text-amber-500 hover:bg-amber-50"
          : "text-muted/50 hover:bg-surface hover:text-muted"
      )}
    >
      <Star size={size} strokeWidth={2} className={favorite ? "fill-amber-400" : ""} />
    </button>
  );
}

export function CategoryDot({
  color,
  name,
}: {
  color?: string;
  name: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12.5px] text-muted">
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: color ?? "#cfd0d6" }}
      />
      {name}
    </span>
  );
}
