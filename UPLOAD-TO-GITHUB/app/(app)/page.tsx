"use client";

import Link from "next/link";
import {
  Library,
  FolderOpen,
  Tags,
  FileDown,
  Plus,
  Upload,
  FolderPlus,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { useVault } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import { StatCard } from "@/components/ui/StatCard";
import { TutorialCard } from "@/components/tutorial/TutorialCard";
import { Button } from "@/components/ui/Button";

const QUICK_ACTIONS = [
  { href: "/tutorials/new", label: "New Tutorial", icon: Plus },
  { href: "/assets", label: "Upload Asset", icon: Upload },
  { href: "/categories", label: "Create Category", icon: FolderPlus },
  { href: "/export", label: "Export Book", icon: BookOpen },
];

export default function DashboardPage() {
  const hydrated = useHydrated();
  const { tutorials, assets, categories, pdfExports, profile } = useVault();

  const recent = [...tutorials]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 6);

  return (
    <div className="animate-fade-in">
      <div className="mb-7">
        <p className="text-[13px] font-medium text-muted">
          Welcome back{hydrated ? `, ${profile.authorName.split(" ")[0]}` : ""}
        </p>
        <h1 className="mt-0.5 text-[27px] font-semibold tracking-tighter text-ink">
          Your editing encyclopedia
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Tutorials"
          value={hydrated ? tutorials.length : "—"}
          icon={<Library size={16} />}
          hint="techniques saved"
        />
        <StatCard
          label="Total Assets"
          value={hydrated ? assets.length : "—"}
          icon={<FolderOpen size={16} />}
          hint="in your library"
        />
        <StatCard
          label="Categories"
          value={hydrated ? categories.length : "—"}
          icon={<Tags size={16} />}
          hint="ways to organize"
        />
        <StatCard
          label="PDFs Exported"
          value={hydrated ? pdfExports : "—"}
          icon={<FileDown size={16} />}
          hint="books generated"
        />
      </div>

      <div className="mt-7">
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-muted">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {QUICK_ACTIONS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-3 rounded-2xl border border-line bg-canvas p-4 transition-all hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-card"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink text-white transition-transform group-hover:scale-105">
                <Icon size={18} strokeWidth={2.2} />
              </span>
              <span className="text-[13.5px] font-medium text-ink">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-9">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[16px] font-semibold tracking-tight text-ink">
            Recent Tutorials
          </h2>
          <Link href="/tutorials">
            <Button variant="ghost" size="sm">
              View all
              <ArrowRight size={14} />
            </Button>
          </Link>
        </div>

        {!hydrated ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-48 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((t) => (
              <TutorialCard key={t.id} tutorial={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
