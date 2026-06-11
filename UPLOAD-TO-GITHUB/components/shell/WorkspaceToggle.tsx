"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Clapperboard, GraduationCap, Target } from "lucide-react";
import { useVault } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Workspace } from "@/lib/types";

/**
 * The center toggle that flips the whole app between the Editing vault, the
 * Academic notes workspace, and the IELTS challenge tracker. Switching also
 * navigates to that workspace's home so the user immediately sees the right
 * content + theme.
 */
export function WorkspaceToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const workspace = useVault((s) => s.workspace);
  const setWorkspace = useVault((s) => s.setWorkspace);

  const go = (w: Workspace) => {
    if (w === workspace) return;
    setWorkspace(w);
    // jump to the workspace's home if we're on a page that belongs to another side
    const academicArea = pathname.startsWith("/notes");
    const ieltsArea = pathname.startsWith("/ielts");
    const editingArea =
      pathname.startsWith("/tutorials") ||
      pathname.startsWith("/assets") ||
      pathname.startsWith("/categories") ||
      pathname.startsWith("/refiner");
    if (w === "academic" && (editingArea || ieltsArea)) router.push("/notes");
    else if (w === "editing" && (academicArea || ieltsArea)) router.push("/tutorials");
    else if (w === "ielts" && (academicArea || editingArea)) router.push("/ielts");
    else router.refresh();
  };

  const items: { w: Workspace; label: string; icon: typeof Clapperboard }[] = [
    { w: "editing", label: "Editing", icon: Clapperboard },
    { w: "academic", label: "Academic", icon: GraduationCap },
    { w: "ielts", label: "IELTS", icon: Target },
  ];

  return (
    <div
      data-tour="workspace-toggle"
      className="flex items-center rounded-full border border-line bg-surface/70 p-0.5 shadow-subtle"
    >
      {items.map(({ w, label, icon: Icon }) => (
        <button
          key={w}
          onClick={() => go(w)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-all",
            workspace === w
              ? "bg-ink text-white shadow-subtle"
              : "text-muted hover:text-ink"
          )}
          aria-pressed={workspace === w}
        >
          <Icon size={14} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
