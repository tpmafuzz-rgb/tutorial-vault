"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Plus, Command, Menu } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Topbar({
  onOpenSearch,
  onOpenMobileNav,
}: {
  onOpenSearch: () => void;
  onOpenMobileNav: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-canvas/80 px-4 backdrop-blur-xl lg:px-6">
      <button
        onClick={onOpenMobileNav}
        className="grid h-10 w-10 place-items-center rounded-xl border border-line text-muted transition-colors hover:bg-surface hover:text-ink md:hidden"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      <button
        onClick={onOpenSearch}
        className="group flex h-10 max-w-md flex-1 items-center gap-2.5 rounded-xl border border-line bg-surface/60 px-3.5 text-muted transition-colors hover:border-ink/20 hover:bg-surface"
      >
        <Search size={16} className="shrink-0" />
        <span className="truncate text-[13.5px]">Search your vault…</span>
        <kbd className="ml-auto hidden items-center gap-0.5 rounded-md border border-line bg-canvas px-1.5 py-0.5 text-[11px] text-muted sm:flex">
          <Command size={11} /> K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <Link href="/tutorials/new">
          <Button size="md">
            <Plus size={16} strokeWidth={2.4} />
            <span className="hidden sm:inline">New Tutorial</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
