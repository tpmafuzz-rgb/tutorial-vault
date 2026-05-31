"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Pencil,
  Trash2,
  Check,
  Link2,
  AlertTriangle,
  Wrench,
  Keyboard,
  GitFork,
  Target,
  Sparkle,
} from "lucide-react";
import { useVault } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { DifficultyBadge, FavoriteButton } from "@/components/tutorial/bits";
import { WorkflowTimeline } from "@/components/tutorial/WorkflowTimeline";
import { RichContent } from "@/components/tutorial/RichContent";

function Block({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-6">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="grid h-7 w-7 place-items-center rounded-lg border border-line bg-surface text-muted">
          {icon}
        </span>
        <h2 className="text-[15px] font-semibold tracking-tight text-ink">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

export default function TutorialDetailPage() {
  const params = useParams();
  const router = useRouter();
  const hydrated = useHydrated();
  const id = String(params.id);
  const { tutorials, categories, assets, deleteTutorial } = useVault();
  const [confirmDel, setConfirmDel] = React.useState(false);

  const tutorial = tutorials.find((t) => t.id === id);

  if (!hydrated) return <div className="skeleton h-screen rounded-2xl" />;

  if (!tutorial) {
    return (
      <div className="py-20 text-center">
        <p className="text-[15px] font-medium text-ink">Tutorial not found</p>
        <Link href="/tutorials">
          <Button variant="secondary" className="mt-4">
            Back to Library
          </Button>
        </Link>
      </div>
    );
  }

  const category = categories.find((c) => c.id === tutorial.categoryId);
  const linkedAssets = assets.filter((a) =>
    tutorial.linkedAssetIds.includes(a.id)
  );

  const remove = () => {
    deleteTutorial(tutorial.id);
    router.push("/tutorials");
  };

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
          <Link href={`/tutorials/${tutorial.id}/edit`}>
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
            {tutorial.serial}
          </span>
          <FavoriteButton id={tutorial.id} favorite={tutorial.favorite} size={18} />
        </div>
        <h1 className="mt-3 text-[30px] font-semibold leading-tight tracking-tighter text-ink">
          {tutorial.name}
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">
          {tutorial.goal}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          {category && (
            <span className="inline-flex items-center gap-1.5 text-[13px] text-muted">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              {category.name}
            </span>
          )}
          <DifficultyBadge difficulty={tutorial.difficulty} />
          {tutorial.software.map((s) => (
            <span
              key={s}
              className="rounded-md border border-line bg-canvas px-2 py-0.5 text-[12px] font-medium text-muted"
            >
              {s}
            </span>
          ))}
          <span className="text-[12.5px] text-muted">
            Updated {formatDate(tutorial.updatedAt)}
          </span>
        </div>
      </div>

      <section className="card mb-7 overflow-hidden p-6">
        <div className="mb-5 flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-ink text-white">
            <Sparkle size={14} />
          </span>
          <h2 className="text-[15px] font-semibold tracking-tight text-ink">
            Workflow Timeline
          </h2>
        </div>
        <WorkflowTimeline steps={tutorial.workflow} />
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {tutorial.finalResult && (
            <Block icon={<Target size={15} />} title="Final Result">
              <p className="text-[14px] leading-relaxed text-ink/90">
                {tutorial.finalResult}
              </p>
            </Block>
          )}

          {tutorial.beforeYouStart && (
            <Block icon={<Check size={15} />} title="Before You Start">
              <p className="whitespace-pre-line text-[14px] leading-relaxed text-ink/90">
                {tutorial.beforeYouStart}
              </p>
            </Block>
          )}

          <Block icon={<GitFork size={15} />} title="Step-by-Step Workflow">
            <RichContent source={tutorial.steps} />
          </Block>

          {tutorial.commonMistakes && (
            <Block icon={<AlertTriangle size={15} />} title="Common Mistakes">
              <RichContent source={tutorial.commonMistakes} />
            </Block>
          )}

          {tutorial.troubleshooting && (
            <Block icon={<Wrench size={15} />} title="Troubleshooting">
              <p className="whitespace-pre-line text-[14px] leading-relaxed text-ink/90">
                {tutorial.troubleshooting}
              </p>
            </Block>
          )}

          {tutorial.alternativeMethods && (
            <Block icon={<GitFork size={15} />} title="Alternative Methods">
              <p className="whitespace-pre-line text-[14px] leading-relaxed text-ink/90">
                {tutorial.alternativeMethods}
              </p>
            </Block>
          )}
        </div>

        <div className="space-y-5">
          {tutorial.assetsRequired.length > 0 && (
            <Block icon={<Sparkle size={15} />} title="Assets Required">
              <ul className="space-y-1.5">
                {tutorial.assetsRequired.map((a) => (
                  <li
                    key={a}
                    className="flex items-center gap-2 text-[13.5px] text-ink/90"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-ink/40" />
                    {a}
                  </li>
                ))}
              </ul>
            </Block>
          )}

          {tutorial.keyboardShortcuts && (
            <Block icon={<Keyboard size={15} />} title="Keyboard Shortcuts">
              <div className="space-y-1.5">
                {tutorial.keyboardShortcuts
                  .split("\n")
                  .filter(Boolean)
                  .map((line, i) => {
                    const [label, ...rest] = line.split(":");
                    const keys = rest.join(":").trim();
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-2 text-[13px]"
                      >
                        <span className="text-muted">{label}</span>
                        {keys && (
                          <kbd className="rounded-md border border-line bg-surface px-1.5 py-0.5 font-mono text-[11.5px] text-ink">
                            {keys}
                          </kbd>
                        )}
                      </div>
                    );
                  })}
              </div>
            </Block>
          )}

          {tutorial.finalChecklist.length > 0 && (
            <Block icon={<Check size={15} />} title="Final Checklist">
              <ul className="space-y-2">
                {tutorial.finalChecklist.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13.5px]">
                    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-[5px] border border-line bg-surface">
                      <Check size={11} className="text-muted" />
                    </span>
                    <span className="text-ink/90">{item}</span>
                  </li>
                ))}
              </ul>
            </Block>
          )}

          {linkedAssets.length > 0 && (
            <Block icon={<Link2 size={15} />} title="Linked Assets">
              <div className="space-y-2">
                {linkedAssets.map((a) => (
                  <Link
                    key={a.id}
                    href="/assets"
                    className="flex items-center gap-2.5 rounded-xl border border-line bg-canvas px-3 py-2 transition-colors hover:bg-surface"
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-surface text-[10px] font-semibold uppercase text-muted">
                      {a.type.slice(0, 3)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-ink">
                        {a.name}
                      </p>
                      <p className="text-[11.5px] text-muted">{a.type}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </Block>
          )}
        </div>
      </div>

      <Modal
        open={confirmDel}
        onClose={() => setConfirmDel(false)}
        title="Delete this tutorial?"
        description={`"${tutorial.name}" will be permanently removed from your vault. This can't be undone.`}
      >
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmDel(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={remove}>
            <Trash2 size={14} />
            Delete Tutorial
          </Button>
        </div>
      </Modal>
    </div>
  );
}
