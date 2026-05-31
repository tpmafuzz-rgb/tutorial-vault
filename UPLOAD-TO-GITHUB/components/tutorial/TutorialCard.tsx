"use client";

import Link from "next/link";
import type { Tutorial } from "@/lib/types";
import { useVault } from "@/lib/store";
import { relativeDate } from "@/lib/utils";
import { DifficultyBadge, FavoriteButton } from "./bits";
import { WorkflowTimelineMini } from "./WorkflowTimeline";

export function TutorialCard({ tutorial }: { tutorial: Tutorial }) {
  const categories = useVault((s) => s.categories);
  const category = categories.find((c) => c.id === tutorial.categoryId);

  return (
    <Link
      href={`/tutorials/${tutorial.id}`}
      className="group flex flex-col rounded-2xl border border-line bg-canvas p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-card"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-md bg-surface px-2 py-0.5 font-mono text-[11px] font-medium text-muted">
          {tutorial.serial}
        </span>
        <FavoriteButton id={tutorial.id} favorite={tutorial.favorite} />
      </div>

      <h3 className="mt-3 line-clamp-2 text-[15.5px] font-semibold leading-snug tracking-tight text-ink">
        {tutorial.name}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted">
        {tutorial.goal}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        {category && (
          <span className="inline-flex items-center gap-1.5 text-[12.5px] text-muted">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            {category.name}
          </span>
        )}
        <DifficultyBadge difficulty={tutorial.difficulty} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-3.5">
        <WorkflowTimelineMini steps={tutorial.workflow} />
        <span className="text-[11.5px] text-muted">
          {relativeDate(tutorial.updatedAt)}
        </span>
      </div>
    </Link>
  );
}
