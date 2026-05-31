"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { GlobalSearch } from "./GlobalSearch";
import { useHydrated } from "@/lib/useHydrated";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [mobileNav, setMobileNav] = React.useState(false);
  const pathname = usePathname();
  // Kick off the one-time Supabase load so the whole app (incl. global search) has data.
  useHydrated();

  React.useEffect(() => {
    const saved = localStorage.getItem("tv-sidebar-collapsed");
    if (saved) setCollapsed(saved === "1");
  }, []);

  // close mobile drawer on route change
  React.useEffect(() => setMobileNav(false), [pathname]);

  const toggle = () => {
    setCollapsed((c) => {
      localStorage.setItem("tv-sidebar-collapsed", c ? "0" : "1");
      return !c;
    });
  };

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-canvas">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar collapsed={collapsed} onToggle={toggle} />
      </div>

      {/* Mobile drawer */}
      {mobileNav && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-ink/20 backdrop-blur-[2px] animate-fade-in"
            onClick={() => setMobileNav(false)}
          />
          <div className="absolute left-0 top-0 h-full animate-scale-in">
            <Sidebar collapsed={false} onToggle={() => setMobileNav(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          onOpenSearch={() => setSearchOpen(true)}
          onOpenMobileNav={() => setMobileNav(true)}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
          <div className="mx-auto w-full max-w-[1180px]">{children}</div>
        </main>
      </div>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
