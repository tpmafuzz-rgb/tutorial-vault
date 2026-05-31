"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft, FileText } from "lucide-react";
import { useVault, searchTutorials } from "@/lib/store";
import { Modal } from "@/components/ui/Modal";

export function GlobalSearch({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { tutorials, categories, assets } = useVault();
  const [q, setQ] = React.useState("");
  const [active, setActive] = React.useState(0);

  const results = React.useMemo(
    () => searchTutorials(tutorials, categories, assets, q).slice(0, 7),
    [tutorials, categories, assets, q]
  );

  React.useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
    }
  }, [open]);

  React.useEffect(() => setActive(0), [q]);

  const go = (id: string) => {
    onClose();
    router.push(`/tutorials/${id}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      go(results[active].id);
    }
  };

  const catName = (id: string | null) =>
    categories.find((c) => c.id === id)?.name ?? "Uncategorized";

  return (
    <Modal open={open} onClose={onClose} className="max-w-xl p-0 overflow-hidden">
      <div className="flex items-center gap-3 border-b border-line px-4">
        <Search size={18} className="shrink-0 text-muted" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search tutorials, categories, assets…"
          className="h-14 w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-muted/70"
        />
      </div>

      <div className="max-h-[340px] overflow-y-auto p-2">
        {results.length === 0 ? (
          <div className="px-3 py-10 text-center text-[13.5px] text-muted">
            {q ? "No matches found." : "Start typing to search your vault."}
          </div>
        ) : (
          results.map((t, i) => (
            <button
              key={t.id}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(t.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                i === active ? "bg-surface" : ""
              }`}
            >
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line bg-canvas text-muted">
                <FileText size={15} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13.5px] font-medium text-ink">
                  {t.name}
                </div>
                <div className="truncate text-[12px] text-muted">
                  {t.serial} · {catName(t.categoryId)}
                </div>
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
