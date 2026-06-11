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
import { NoteBookDocument } from "@/components/pdf/NoteBookDocument";
import { IeltsBookDocument } from "@/components/pdf/IeltsBookDocument";
import { dayHasData } from "@/lib/ielts";

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

type Scope = "all" | "favorites" | "category" | "subject";

export default function ExportPage() {
  const hydrated = useHydrated();
  const {
    workspace,
    tutorials,
    categories,
    notes,
    ieltsChallenges,
    ieltsDays,
    profile,
    logExport,
  } = useVault();
  const isAcademic = workspace === "academic";
  const isIelts = workspace === "ielts";

  const [scope, setScope] = React.useState<Scope>("all");
  const [categoryId, setCategoryId] = React.useState<string>(
    categories[0]?.id ?? ""
  );
  const [subject, setSubject] = React.useState<string>("");
  const [title, setTitle] = React.useState(profile.bookTitle);
  const [author, setAuthor] = React.useState(profile.authorName);

  React.useEffect(() => {
    setAuthor(profile.authorName);
  }, [profile.authorName]);

  // sensible default title per workspace
  React.useEffect(() => {
    setTitle(
      isIelts
        ? "IELTS Comeback Challenge"
        : isAcademic
          ? "My Study Notebook"
          : profile.bookTitle
    );
    setScope("all");
  }, [isAcademic, isIelts, profile.bookTitle]);

  // IELTS: which challenge to export
  const [ieltsId, setIeltsId] = React.useState("");
  React.useEffect(() => {
    if (isIelts && !ieltsId && ieltsChallenges.length) {
      const active = ieltsChallenges.find((c) => c.status === "active");
      setIeltsId((active ?? ieltsChallenges[0]).id);
    }
  }, [isIelts, ieltsId, ieltsChallenges]);
  const ieltsChallenge = ieltsChallenges.find((c) => c.id === ieltsId) ?? null;
  const ieltsTrackedDays = React.useMemo(
    () =>
      ieltsChallenge
        ? ieltsDays.filter(
            (d) => d.challengeId === ieltsChallenge.id && dayHasData(d)
          )
        : [],
    [ieltsChallenge, ieltsDays]
  );

  const subjects = React.useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => n.subject.trim() && set.add(n.subject.trim()));
    return [...set].sort();
  }, [notes]);

  // editing selection
  const selectedTutorials = React.useMemo(() => {
    let list = [...tutorials].sort((a, b) => a.serial.localeCompare(b.serial));
    if (scope === "favorites") list = list.filter((t) => t.favorite);
    if (scope === "category") list = list.filter((t) => t.categoryId === categoryId);
    return list;
  }, [tutorials, scope, categoryId]);

  // academic selection
  const selectedNotes = React.useMemo(() => {
    let list = [...notes].sort((a, b) => a.serial.localeCompare(b.serial));
    if (scope === "favorites") list = list.filter((n) => n.favorite);
    if (scope === "subject") list = list.filter((n) => n.subject === subject);
    return list;
  }, [notes, scope, subject]);

  const count = isIelts
    ? ieltsChallenge
      ? ieltsTrackedDays.length
      : 0
    : isAcademic
      ? selectedNotes.length
      : selectedTutorials.length;
  const dateLabel = formatDate(new Date().toISOString());
  const fallback = isIelts
    ? "ielts-challenge"
    : isAcademic
      ? "study-notebook"
      : "editing-book";
  const fileName = `${title.replace(/[^\w\s-]/g, "").trim() || fallback}.pdf`;

  const doc =
    isIelts && ieltsChallenge ? (
      <IeltsBookDocument
        challenge={ieltsChallenge}
        days={ieltsTrackedDays}
        authorName={author || "Student"}
        dateLabel={dateLabel}
      />
    ) : isAcademic ? (
      <NoteBookDocument
        notes={selectedNotes}
        bookTitle={title || "My Study Notebook"}
        authorName={author || "Author"}
        dateLabel={dateLabel}
      />
    ) : (
      <BookDocument
        tutorials={selectedTutorials}
        bookTitle={title || "My Editing Encyclopedia"}
        authorName={author || "Creator"}
        dateLabel={dateLabel}
      />
    );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Book Export"
        subtitle={
          isIelts
            ? "Download your 30-day challenge as a filled-in tracker PDF."
            : isAcademic
              ? "Turn your notes into a study handbook PDF."
              : "Turn your vault into a published-feeling PDF handbook."
        }
      />

      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        {/* Config */}
        <div className="space-y-5">
          <div className="card p-5">
            <h2 className="mb-4 text-[14px] font-semibold text-ink">Configure</h2>
            <div className="space-y-4">
              {isIelts ? (
                <Field label="Challenge">
                  <Select
                    value={ieltsId}
                    onChange={(e) => setIeltsId(e.target.value)}
                  >
                    {ieltsChallenges.length === 0 && (
                      <option value="">No challenges yet</option>
                    )}
                    {ieltsChallenges.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.serial}
                        {c.studentName ? ` — ${c.studentName}` : ""} ({c.status})
                      </option>
                    ))}
                  </Select>
                </Field>
              ) : (
              <Field label="What to include">
                <Select value={scope} onChange={(e) => setScope(e.target.value as Scope)}>
                  <option value="all">
                    {isAcademic ? "All notes" : "All tutorials"}
                  </option>
                  <option value="favorites">Favorites only</option>
                  {isAcademic ? (
                    <option value="subject">By subject</option>
                  ) : (
                    <option value="category">By category</option>
                  )}
                </Select>
              </Field>
              )}

              {!isAcademic && scope === "category" && (
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

              {isAcademic && scope === "subject" && (
                <Field label="Subject">
                  <Select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  >
                    <option value="">Choose a subject…</option>
                    {subjects.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
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
                {count}{" "}
                {isIelts ? "tracked day" : isAcademic ? "note" : "tutorial"}
                {count === 1 ? "" : "s"}
              </span>
            </div>

            <div className="mt-4">
              {hydrated && count > 0 ? (
                <PDFDownloadLink document={doc} fileName={fileName}>
                  {({ loading }: { loading: boolean }) => (
                    <Button
                      className="w-full ws-accent-bg"
                      onClick={() =>
                        !loading &&
                        logExport(title || (isAcademic ? "Study Notebook" : "Editing Book"), count)
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
                  {count === 0 ? "Nothing to export" : "Loading…"}
                </Button>
              )}
            </div>
          </div>

          <div className="card flex items-start gap-3 p-4">
            <span className="ws-accent-bg grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink text-white">
              <BookOpen size={15} />
            </span>
            <p className="text-[12.5px] leading-relaxed text-muted">
              {isIelts
                ? "Includes a cover, the filled 30-day progress grid, and one chapter per tracked day — all six parts plus the Success Rule."
                : isAcademic
                  ? "Includes a cover, auto table of contents, one chapter per note with its sections, page numbers, and a footer."
                  : "Includes a cover, auto table of contents, one chapter per tutorial, page numbers, and a footer."}
            </p>
          </div>
        </div>

        {/* Live preview */}
        <div className="card overflow-hidden p-2">
          <div className="h-[72vh] min-h-[480px] w-full overflow-hidden rounded-xl">
            {hydrated && count > 0 ? (
              <PDFViewer
                showToolbar
                style={{ width: "100%", height: "100%", border: "none" }}
              >
                {doc}
              </PDFViewer>
            ) : (
              <div className="flex h-full items-center justify-center text-center text-[13.5px] text-muted">
                {count === 0
                  ? `Nothing matches this selection yet.`
                  : "Loading preview…"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
