"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { BookOpen, Download, FileText } from "lucide-react";
import { useVault } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { BookDocument } from "@/components/pdf/BookDocument";

// react-pdf is browser-only — load with no SSR. Cast to `any`: next/dynamic
// erases the render-prop child type that PDFDownloadLink relies on.
const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.PDFViewer),
  { ssr: false, loading: () => <div className="skeleton h-full w-full rounded-xl" /> }
) as any;
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.PDFDownloadLink),
  { ssr: false }
) as any;

type Scope = "all" | "favorites" | "category";

export default function ExportPage() {
  const hydrated = useHydrated();
  const { tutorials, categories, profile, logExport } = useVault();

  const [scope, setScope] = React.useState<Scope>("all");
  const [categoryId, setCategoryId] = React.useState<string>(
    categories[0]?.id ?? ""
  );
  const [title, setTitle] = React.useState(profile.bookTitle);
  const [author, setAuthor] = React.useState(profile.authorName);

  React.useEffect(() => {
    setTitle(profile.bookTitle);
    setAuthor(profile.authorName);
  }, [profile.bookTitle, profile.authorName]);

  const selected = React.useMemo(() => {
    let list = [...tutorials].sort((a, b) =>
      a.serial.localeCompare(b.serial)
    );
    if (scope === "favorites") list = list.filter((t) => t.favorite);
    if (scope === "category") list = list.filter((t) => t.categoryId === categoryId);
    return list;
  }, [tutorials, scope, categoryId]);

  const dateLabel = formatDate(new Date().toISOString());
  const fileName = `${title.replace(/[^\w\s-]/g, "").trim() || "editing-book"}.pdf`;

  const doc = (
    <BookDocument
      tutorials={selected}
      bookTitle={title || "My Editing Encyclopedia"}
      authorName={author || "Creator"}
      dateLabel={dateLabel}
    />
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Book Export"
        subtitle="Turn your vault into a published-feeling PDF handbook."
      />

      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        {/* Config */}
        <div className="space-y-5">
          <div className="card p-5">
            <h2 className="mb-4 text-[14px] font-semibold text-ink">Configure</h2>
            <div className="space-y-4">
              <Field label="What to include">
                <Select value={scope} onChange={(e) => setScope(e.target.value as Scope)}>
                  <option value="all">All tutorials</option>
                  <option value="favorites">Favorites only</option>
                  <option value="category">By category</option>
                </Select>
              </Field>

              {scope === "category" && (
                <Field label="Category">
                  <Select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}

              <Field label="Book Title">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </Field>
              <Field label="Author Name">
                <Input value={author} onChange={(e) => setAuthor(e.target.value)} />
              </Field>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-xl bg-surface px-3.5 py-2.5">
              <span className="inline-flex items-center gap-2 text-[13px] text-muted">
                <FileText size={15} />
                {selected.length} tutorial{selected.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="mt-4">
              {hydrated && selected.length > 0 ? (
                <PDFDownloadLink document={doc} fileName={fileName}>
                  {({ loading }: { loading: boolean }) => (
                    <Button
                      className="w-full"
                      onClick={() =>
                        !loading && logExport(title || "Editing Book", selected.length)
                      }
                      disabled={loading}
                    >
                      <Download size={15} />
                      {loading ? "Preparing PDF…" : "Download PDF"}
                    </Button>
                  )}
                </PDFDownloadLink>
              ) : (
                <Button className="w-full" disabled>
                  <Download size={15} />
                  {selected.length === 0 ? "Nothing to export" : "Loading…"}
                </Button>
              )}
            </div>
          </div>

          <div className="card flex items-start gap-3 p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink text-white">
              <BookOpen size={15} />
            </span>
            <p className="text-[12.5px] leading-relaxed text-muted">
              Includes a cover, auto table of contents, one chapter per tutorial,
              page numbers, and a “TUTORIAL Knowledge Vault” footer.
            </p>
          </div>
        </div>

        {/* Live preview */}
        <div className="card overflow-hidden p-2">
          <div className="h-[72vh] min-h-[480px] w-full overflow-hidden rounded-xl">
            {hydrated && selected.length > 0 ? (
              <PDFViewer
                showToolbar
                style={{ width: "100%", height: "100%", border: "none" }}
              >
                {doc}
              </PDFViewer>
            ) : (
              <div className="flex h-full items-center justify-center text-center text-[13.5px] text-muted">
                {selected.length === 0
                  ? "No tutorials match this selection yet."
                  : "Loading preview…"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
