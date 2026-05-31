"use client";

import * as React from "react";
import Link from "next/link";
import { LayoutGrid, List as ListIcon, Plus, Search, Library } from "lucide-react";
import { useVault, searchTutorials } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import { relativeDate, cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { TutorialCard } from "@/components/tutorial/TutorialCard";
import { DifficultyBadge, FavoriteButton } from "@/components/tutorial/bits";
import { EmptyState } from "@/components/ui/EmptyState";

type View = "grid" | "list";

export default function TutorialsPage() {
  const hydrated = useHydrated();
  const { tutorials, categories, assets } = useVault();
  const [view, setView] = React.useState<View>("grid");
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState<string>("all");
  const [diff, setDiff] = React.useState<string>("all");

  const filtered = React.useMemo(() => {
    let list = searchTutorials(tutorials, categories, assets, q);
    if (cat !== "all") list = list.filter((t) => t.categoryId === cat);
    if (diff !== "all") list = list.filter((t) => t.difficulty === diff);
    return list;
  }, [tutorials, categories, assets, q, cat, diff]);

  const catObj = (id: string | null) => categories.find((c) => c.id === id);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Tutorials"
        subtitle="The heart of your vault — every technique you've ever saved."
        actions={
          <Link href="/tutorials/new">
            <Button>
              <Plus size={16} strokeWidth={2.4} />
              New Tutorial
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
            placeholder="Filter tutorials…"
            className="input-base pl-10"
          />
        </div>

        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="input-base w-auto cursor-pointer"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={diff}
          onChange={(e) => setDiff(e.target.value)}
          className="input-base w-auto cursor-pointer"
        >
          <option value="all">All levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>

        <div className="flex items-center rounded-xl border border-line bg-canvas p-0.5">
          {(["grid", "list"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "grid h-8 w-8 place-items-center rounded-lg transition-colors",
                view === v ? "bg-ink text-white" : "text-muted hover:text-ink"
              )}
              aria-label={`${v} view`}
            >
              {v === "grid" ? <LayoutGrid size={15} /> : <ListIcon size={15} />}
            </button>
          ))}
        </div>
      </div>

      {!hydrated ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-48 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Library size={20} />}
          title={tutorials.length === 0 ? "No tutorials yet" : "No matches"}
          description={
            tutorials.length === 0
              ? "Save your first editing technique and start building your encyclopedia."
              : "Try a different search or clear your filters."
          }
          action={
            tutorials.length === 0 ? (
              <Link href="/tutorials/new">
                <Button>
                  <Plus size={16} />
                  New Tutorial
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <TutorialCard key={t.id} tutorial={t} />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-canvas">
          <div className="hidden items-center gap-4 border-b border-line bg-surface/50 px-5 py-2.5 text-[11.5px] font-semibold uppercase tracking-wide text-muted md:flex">
            <span className="w-16">#</span>
            <span className="flex-1">Title</span>
            <span className="w-36">Category</span>
            <span className="w-28">Difficulty</span>
            <span className="w-24">Updated</span>
            <span className="w-8" />
          </div>
          {filtered.map((t) => {
            const c = catObj(t.categoryId);
            return (
              <Link
                key={t.id}
                href={`/tutorials/${t.id}`}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line px-5 py-3.5 transition-colors last:border-0 hover:bg-surface/50"
              >
                <span className="w-16 font-mono text-[12px] text-muted">
                  {t.serial}
                </span>
                <span className="w-full flex-1 truncate text-[14px] font-medium text-ink md:w-auto">
                  {t.name}
                </span>
                <span className="w-36">
                  {c ? (
                    <span className="inline-flex items-center gap-1.5 text-[12.5px] text-muted">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: c.color }}
                      />
                      {c.name}
                    </span>
                  ) : (
                    <span className="text-[12.5px] text-muted/60">—</span>
                  )}
                </span>
                <span className="w-28">
                  <DifficultyBadge difficulty={t.difficulty} />
                </span>
                <span className="w-24 text-[12.5px] text-muted">
                  {relativeDate(t.updatedAt)}
                </span>
                <span className="w-8">
                  <FavoriteButton id={t.id} favorite={t.favorite} />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
