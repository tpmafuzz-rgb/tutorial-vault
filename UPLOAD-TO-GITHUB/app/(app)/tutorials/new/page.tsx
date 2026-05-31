"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { TutorialForm } from "@/components/form/TutorialForm";
import type { TutorialFormValues } from "@/lib/schema";

function NewTutorialInner() {
  const params = useSearchParams();
  const [initial, setInitial] = React.useState<Partial<TutorialFormValues>>();

  // Pre-fill from the AI Refiner handoff (sessionStorage)
  React.useEffect(() => {
    if (params.get("from") === "refiner") {
      const raw = sessionStorage.getItem("tv-refiner-draft");
      if (raw) {
        try {
          setInitial(JSON.parse(raw));
        } catch {
          /* ignore */
        }
        sessionStorage.removeItem("tv-refiner-draft");
      }
    }
  }, [params]);

  return <TutorialForm mode="create" initial={initial} />;
}

export default function NewTutorialPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-2">
        <h1 className="text-[26px] font-semibold tracking-tighter text-ink">
          New Tutorial
        </h1>
        <p className="mt-1 text-[14px] text-muted">
          A serial number is assigned automatically once you save.
        </p>
      </div>
      <React.Suspense fallback={<div className="skeleton h-screen rounded-2xl" />}>
        <NewTutorialInner />
      </React.Suspense>
    </div>
  );
}
