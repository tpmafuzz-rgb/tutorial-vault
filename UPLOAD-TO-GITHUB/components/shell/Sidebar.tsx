"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Library,
  FolderOpen,
  Tags,
  Star,
  BookOpen,
  Settings,
  Sparkles,
  NotebookPen,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useVault } from "@/lib/store";

const EDITING_NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/tutorials", label: "Tutorials", icon: Library },
  { href: "/assets", label: "Assets", icon: FolderOpen },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/favorites", label: "Favorites", icon: Star },
  { href: "/refiner", label: "AI Refiner", icon: Sparkles },
  { href: "/export", label: "Book Export", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

const ACADEMIC_NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/notes", label: "Notes", icon: NotebookPen },
  { href: "/favorites", label: "Favorites", icon: Star },
  { href: "/export", label: "Book Export", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const workspace = useVault((s) => s.workspace);
  const nav = workspace === "academic" ? ACADEMIC_NAV : EDITING_NAV;

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      className={cn(
        "sticky top-0 z-30 flex h-screen shrink-0 flex-col border-r border-line bg-surface/60 transition-[width] duration-300 ease-out",
        collapsed ? "w-[68px]" : "w-[244px]"
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center gap-2.5 px-4",
          collapsed && "justify-center px-0"
        )}
      >
        <div className="ws-mark grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-ink text-white">
          <span className="text-[15px] font-bold tracking-tight">T</span>
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-none">
            <span className="text-[14.5px] font-semibold tracking-tight text-ink">
              TUTORIAL
            </span>
            <span className="mt-0.5 text-[11px] text-muted">
              {workspace === "academic" ? "Study Notebook" : "Knowledge Vault"}
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {nav.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] font-medium transition-all",
                collapsed && "justify-center px-0",
                active
                  ? "bg-canvas text-ink shadow-subtle"
                  : "text-muted hover:bg-canvas/70 hover:text-ink"
              )}
            >
              {active && (
                <span className="ws-accent-rail absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-ink" />
              )}
              <Icon size={18} strokeWidth={active ? 2.2 : 1.9} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line p-3">
        <button
          onClick={onToggle}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium text-muted transition-colors hover:bg-canvas hover:text-ink",
            collapsed && "justify-center px-0"
          )}
        >
          {collapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <>
              <PanelLeftClose size={18} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
