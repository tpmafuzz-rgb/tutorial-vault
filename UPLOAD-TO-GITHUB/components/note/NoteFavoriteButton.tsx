"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVault } from "@/lib/store";

export function NoteFavoriteButton({
  id,
  favorite,
  size = 16,
}: {
  id: string;
  favorite: boolean;
  size?: number;
}) {
  const toggle = useVault((s) => s.toggleNoteFavorite);
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
