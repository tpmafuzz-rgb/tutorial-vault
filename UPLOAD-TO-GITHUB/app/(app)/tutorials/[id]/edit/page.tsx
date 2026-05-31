"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useVault } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import { TutorialForm } from "@/components/form/TutorialForm";
import { Button } from "@/components/ui/Button";
import type { TutorialFormValues } from "@/lib/schema";

export default function EditTutorialPage() {
  const params = useParams();
  const hydrated = useHydrated();
  const id = String(params.id);
  const tutorial = useVault((s) => s.tutorials.find((t) => t.id === id));

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

  const initial: Partial<TutorialFormValues> = {
    name: tutorial.name,
    goal: tutorial.goal,
    finalResult: tutorial.finalResult,
    software: tutorial.software,
    difficulty: tutorial.difficulty,
    categoryId: tutorial.categoryId,
    assetsRequired: tutorial.assetsRequired,
    beforeYouStart: tutorial.beforeYouStart,
    steps: tutorial.steps,
    commonMistakes: tutorial.commonMistakes,
    troubleshooting: tutorial.troubleshooting,
    keyboardShortcuts: tutorial.keyboardShortcuts,
    alternativeMethods: tutorial.alternativeMethods,
    finalChecklist: tutorial.finalChecklist,
    workflow: tutorial.workflow,
    linkedAssetIds: tutorial.linkedAssetIds,
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-2">
        <h1 className="text-[26px] font-semibold tracking-tighter text-ink">
          Edit Tutorial
        </h1>
        <p className="mt-1 text-[14px] text-muted">
          {tutorial.serial} · {tutorial.name}
        </p>
      </div>
      <TutorialForm mode="edit" tutorialId={tutorial.id} initial={initial} />
    </div>
  );
}
