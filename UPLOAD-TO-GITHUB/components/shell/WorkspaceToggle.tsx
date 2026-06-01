"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Clapperboard, GraduationCap } from "lucide-react";
import { useVault } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * The center toggle that flips the whole app between the Editing vault and the
 * Academic notes workspace. Switching also navigates to that workspace's home
 * so the user immediately sees the right content + theme.
 */
export function WorkspaceToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const workspace = useVault((s) => s.workspace);
  const setWorkspace = useVault((s) => s.setWorkspace);

  const go = (w: "editing" | "academic") => {
    if (w === workspace) return;
    setWorkspace(w);
    // jump to the workspace's home if we're on a page that belongs to the other side
    const academicArea = pathname.startsWith("/notes");
    const editingArea =
      pathname.startsWith("/tutorials") ||
      pathname.startsWith("/assets") ||
      pathname.startsWith("/categories") ||
      pathname.startsWith("/refiner");
    if (w === "academic" && editingArea) router.push("/notes");
    else if (w === "editing" && academicArea) router.push("/tutorials");
    else router.refresh();
  };

  return (
    <div className="flex items-center rounded-full border border-line bg-surface/70 p-0.5 shadow-subtle">
      <button
        onClick={() => go("editing")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-all",
          workspace === "editing"
            ? "bg-ink text-white shadow-subtle"
            : "text-muted hover:text-ink"
        )}
        aria-pressed={workspace === "editing"}
      >
        <Clapperboard size={14} />
        <span className="hidden sm:inline">Editing</span>
      </button>
      <button
        onClick={() => go("academic")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-all",
          workspace === "academic"
            ? "bg-ink text-white shadow-subtle"
            : "text-muted hover:text-ink"
        )}
        aria-pressed={workspace === "academic"}
      >
        <GraduationCap size={14} />
        <span className="hidden sm:inline">Academic</span>
      </button>
    </div>
  );
}
