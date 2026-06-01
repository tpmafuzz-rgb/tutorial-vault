"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Save, ChevronLeft, AlertCircle } from "lucide-react";
import { useVault, noteLabelSuggestions, type NewNoteInput } from "@/lib/store";
import { noteFormSchema, type NoteFormValues } from "@/lib/schema";
import { uid } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { NoteBlockEditor } from "./NoteBlockEditor";

const empty: NoteFormValues = {
  title: "",
  subject: "",
  level: "",
  blocks: [{ id: "seed", label: "", content: "" }],
};

export function NoteForm({
  initial,
  mode,
  noteId,
}: {
  initial?: Partial<NoteFormValues>;
  mode: "create" | "edit";
  noteId?: string;
}) {
  const router = useRouter();
  const { addNote, updateNote, notes } = useVault();
  const suggestions = React.useMemo(() => noteLabelSuggestions(notes), [notes]);

  const [values, setValues] = React.useState<NoteFormValues>(() => ({
    ...empty,
    ...initial,
    blocks:
      initial?.blocks && initial.blocks.length
        ? initial.blocks
        : [{ id: uid("b"), label: "", content: "" }],
  }));
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);

  const set = <K extends keyof NoteFormValues>(key: K, val: NoteFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: val }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    const parsed = noteFormSchema.safeParse(values);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        errs[issue.path[0] as string] = issue.message;
      }
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrors({});

    // drop fully-empty trailing blocks, keep labeled or filled ones
    const cleanBlocks = parsed.data.blocks.filter(
      (b) => b.label.trim() || b.content.trim()
    );
    const payload: NewNoteInput = { ...parsed.data, blocks: cleanBlocks };

    setSaving(true);
    try {
      if (mode === "create") {
        const id = await addNote(payload);
        if (id) router.push(`/notes/${id}`);
        else {
          setErrors({ form: "Couldn't save. Please try again." });
          setSaving(false);
        }
      } else if (noteId) {
        await updateNote(noteId, payload);
        router.push(`/notes/${noteId}`);
      }
    } catch {
      setErrors({ form: "Couldn't save. Please try again." });
      setSaving(false);
    }
  };

  const errorList = Object.values(errors);

  return (
    <form onSubmit={submit} className="space-y-5 pb-10">
      <div className="sticky top-16 z-10 -mx-4 mb-1 flex items-center justify-between border-b border-line bg-canvas/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-muted transition-colors hover:text-ink"
        >
          <ChevronLeft size={16} />
          Back
        </button>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" className="ws-accent-bg" disabled={saving}>
            <Save size={15} />
            {saving ? "Saving…" : mode === "create" ? "Create Note" : "Save Changes"}
          </Button>
        </div>
      </div>

      {errorList.length > 0 && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Please fix the following:</p>
            <ul className="mt-1 list-inside list-disc">
              {errorList.map((er, i) => (
                <li key={i}>{er}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <section className="card p-6">
        <div className="mb-5">
          <h2 className="text-[15px] font-semibold tracking-tight text-ink">
            About this note
          </h2>
          <p className="mt-0.5 text-[13px] text-muted">
            A serial number (NOTE-0001) is assigned automatically once you save.
          </p>
        </div>
        <div className="space-y-5">
          <Field label="Title">
            <Input
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Cell Structure & Organelles"
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Subject" optional>
              <Input
                value={values.subject}
                onChange={(e) => set("subject", e.target.value)}
                placeholder="e.g. Biology"
              />
            </Field>
            <Field label="Level" optional>
              <Input
                value={values.level}
                onChange={(e) => set("level", e.target.value)}
                placeholder="e.g. Class 11"
              />
            </Field>
          </div>
        </div>
      </section>

      <section className="card p-6">
        <div className="mb-5">
          <h2 className="text-[15px] font-semibold tracking-tight text-ink">
            Your notes
          </h2>
          <p className="mt-0.5 text-[13px] text-muted">
            Write freely in sections, then label each one (Introduction, Key
            Terms…). Labels build the Table of Contents and are remembered for
            next time.
          </p>
        </div>
        <NoteBlockEditor
          value={values.blocks}
          onChange={(b) => set("blocks", b)}
          labelSuggestions={suggestions}
        />
      </section>
    </form>
  );
}
