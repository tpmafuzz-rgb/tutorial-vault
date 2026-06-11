"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft, FileText } from "lucide-react";
import { useVault, searchTutorials, searchNotes } from "@/lib/store";
import { Modal } from "@/components/ui/Modal";

interface Hit {
  id: string;
  name: string;
  meta: string;
  href: string;
}

export function GlobalSearch({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { workspace, tutorials, categories, assets, notes, ieltsChallenges } =
    useVault();
  const isAcademic = workspace === "academic";
  const isIelts = workspace === "ielts";
  const [q, setQ] = React.useState("");
  const [active, setActive] = React.useState(0);

  const catName = (id: string | null) =>
    categories.find((c) => c.id === id)?.name ?? "Uncategorized";

  const results: Hit[] = React.useMemo(() => {
    if (isIelts) {
      const query = q.trim().toLowerCase();
      return ieltsChallenges
        .filter(
          (c) =>
            !query ||
            c.serial.toLowerCase().includes(query) ||
            c.studentName.toLowerCase().includes(query) ||
            c.targetBand.toLowerCase().includes(query)
        )
        .slice(0, 7)
        .map((c) => ({
          id: c.id,
          name: c.studentName || "Comeback Challenge",
          meta: `${c.serial} · ${c.status}${c.targetBand ? " · Band " + c.targetBand : ""}`,
          href: `/ielts/${c.id}`,
        }));
    }
    if (isAcademic) {
      return searchNotes(notes, q)
        .slice(0, 7)
        .map((n) => ({
          id: n.id,
          name: n.title,
          meta: `${n.serial}${n.subject ? " · " + n.subject : ""}`,
          href: `/notes/${n.id}`,
        }));
    }
    return searchTutorials(tutorials, categories, assets, q)
      .slice(0, 7)
      .map((t) => ({
        id: t.id,
        name: t.name,
        meta: `${t.serial} · ${catName(t.categoryId)}`,
        href: `/tutorials/${t.id}`,
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIelts, isAcademic, tutorials, categories, assets, notes, ieltsChallenges, q]);

  React.useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
    }
  }, [open]);

  React.useEffect(() => setActive(0), [q]);

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      go(results[active].href);
    }
  };

  return (
    <Modal open={open} onClose={onClose} className="max-w-xl p-0 overflow-hidden">
      <div className="flex items-center gap-3 border-b border-line px-4">
        <Search size={18} className="shrink-0 text-muted" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={
            isIelts
              ? "Search challenges by serial, name, band…"
              : isAcademic
                ? "Search notes by title, subject, content…"
                : "Search tutorials, categories, assets…"
          }
          className="h-14 w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-muted/70"
        />
      </div>

      <div className="max-h-[340px] overflow-y-auto p-2">
        {results.length === 0 ? (
          <div className="px-3 py-10 text-center text-[13.5px] text-muted">
            {q
              ? "No matches found."
              : isIelts
                ? "Start typing to search your challenges."
                : isAcademic
                  ? "Start typing to search your notes."
                  : "Start typing to search your vault."}
          </div>
        ) : (
          results.map((r, i) => (
            <button
              key={r.id}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(r.href)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                i === active ? "bg-surface" : ""
              }`}
            >
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line bg-canvas text-muted">
                <FileText size={15} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13.5px] font-medium text-ink">
                  {r.name}
                </div>
                <div className="truncate text-[12px] text-muted">{r.meta}</div>
              </div>
              {i === active && (
                <CornerDownLeft size={14} className="shrink-0 text-muted" />
              )}
            </button>
          ))
        )}
      </div>

      <div className="flex items-center justify-between border-t border-line bg-surface/50 px-4 py-2.5 text-[11.5px] text-muted">
        <span>Navigate with ↑ ↓</span>
        <span>Enter to open · Esc to close</span>
      </div>
    </Modal>
  );
}
