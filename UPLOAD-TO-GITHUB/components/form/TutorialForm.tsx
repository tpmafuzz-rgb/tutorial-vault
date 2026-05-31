"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Save, ChevronLeft, AlertCircle } from "lucide-react";
import { useVault, type NewTutorialInput } from "@/lib/store";
import { tutorialFormSchema, type TutorialFormValues } from "@/lib/schema";
import { buildWorkflowFromSteps } from "@/lib/workflow";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, Select } from "@/components/ui/Field";
import { TagInput } from "./TagInput";
import { ChecklistEditor } from "./ChecklistEditor";
import { WorkflowEditor } from "./WorkflowEditor";

const SOFTWARE_SUGGEST = [
  "CapCut",
  "Premiere Pro",
  "After Effects",
  "DaVinci Resolve",
  "Final Cut Pro",
];
const ASSET_SUGGEST = ["LUTs", "Fonts", "Sound Effects", "Presets", "Overlays"];

const emptyValues: TutorialFormValues = {
  name: "",
  goal: "",
  finalResult: "",
  software: [],
  difficulty: "Beginner",
  categoryId: null,
  assetsRequired: [],
  beforeYouStart: "",
  steps: "",
  commonMistakes: "",
  troubleshooting: "",
  keyboardShortcuts: "",
  alternativeMethods: "",
  finalChecklist: [],
  workflow: [],
  linkedAssetIds: [],
};

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-6">
      <div className="mb-5">
        <h2 className="text-[15px] font-semibold tracking-tight text-ink">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-[13px] text-muted">{description}</p>
        )}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export function TutorialForm({
  initial,
  mode,
  tutorialId,
}: {
  initial?: Partial<TutorialFormValues>;
  mode: "create" | "edit";
  tutorialId?: string;
}) {
  const router = useRouter();
  const { categories, assets, addTutorial, updateTutorial } = useVault();
  const [values, setValues] = React.useState<TutorialFormValues>({
    ...emptyValues,
    ...initial,
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);

  const set = <K extends keyof TutorialFormValues>(
    key: K,
    val: TutorialFormValues[K]
  ) => setValues((v) => ({ ...v, [key]: val }));

  const autoWorkflow = () => set("workflow", buildWorkflowFromSteps(values.steps));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    const parsed = tutorialFormSchema.safeParse(values);
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

    const workflow =
      parsed.data.workflow.length > 0
        ? parsed.data.workflow
        : buildWorkflowFromSteps(parsed.data.steps);

    const payload: NewTutorialInput = { ...parsed.data, workflow };

    setSaving(true);
    try {
      if (mode === "create") {
        const id = await addTutorial(payload);
        if (id) router.push(`/tutorials/${id}`);
        else {
          setErrors({ form: "Couldn't save. Please try again." });
          setSaving(false);
        }
      } else if (tutorialId) {
        await updateTutorial(tutorialId, payload);
        router.push(`/tutorials/${tutorialId}`);
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
          <Button type="submit" disabled={saving}>
            <Save size={15} />
            {saving
              ? "Saving…"
              : mode === "create"
                ? "Create Tutorial"
                : "Save Changes"}
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

      <Section
        title="Overview"
        description="The essentials — what this technique is and what you'll achieve."
      >
        <Field label="Tutorial Name">
          <Input
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Cinematic Teal & Orange Color Grade"
          />
        </Field>
        <Field label="Goal" hint="What final result will be achieved?">
          <Textarea
            rows={2}
            value={values.goal}
            onChange={(e) => set("goal", e.target.value)}
            placeholder="Give any footage a filmic look with depth and contrast."
          />
        </Field>
        <Field label="Final Result" hint="Describe the completed edit." optional>
          <Textarea
            rows={2}
            value={values.finalResult}
            onChange={(e) => set("finalResult", e.target.value)}
            placeholder="Footage that reads cinematic — warm skin, teal shadows."
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Difficulty">
            <Select
              value={values.difficulty}
              onChange={(e) =>
                set("difficulty", e.target.value as TutorialFormValues["difficulty"])
              }
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </Select>
          </Field>
          <Field label="Category">
            <Select
              value={values.categoryId ?? ""}
              onChange={(e) => set("categoryId", e.target.value || null)}
            >
              <option value="">Uncategorized</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Software Used">
          <TagInput
            value={values.software}
            onChange={(v) => set("software", v)}
            placeholder="Add software…"
            suggestions={SOFTWARE_SUGGEST}
          />
        </Field>
        <Field label="Assets Required" optional>
          <TagInput
            value={values.assetsRequired}
            onChange={(v) => set("assetsRequired", v)}
            placeholder="e.g. LUTs, Fonts, Sound Effects…"
            suggestions={ASSET_SUGGEST}
          />
        </Field>
      </Section>

      <Section
        title="The Workflow"
        description="The main content — the step-by-step technique and its visual timeline."
      >
        <Field label="Before You Start" hint="Preparation instructions." optional>
          <Textarea
            rows={3}
            value={values.beforeYouStart}
            onChange={(e) => set("beforeYouStart", e.target.value)}
            placeholder="Work on a copy of your sequence…"
          />
        </Field>
        <Field
          label="Step-by-Step Workflow"
          hint="Supports headings (## ), bullet (- ) and numbered (1. ) lists, and links."
        >
          <Textarea
            rows={10}
            value={values.steps}
            onChange={(e) => set("steps", e.target.value)}
            placeholder={"## Balance first\n- Fix exposure\n\n## Apply the look\n1. Drop the LUT\n2. Adjust color wheels"}
            className="font-mono text-[13px]"
          />
        </Field>

        <Field label="Workflow Timeline">
          <WorkflowEditor
            value={values.workflow}
            onChange={(v) => set("workflow", v)}
            onAutoGenerate={autoWorkflow}
          />
        </Field>
      </Section>

      <Section
        title="Reference"
        description="Everything that makes this tutorial reusable months from now."
      >
        <Field label="Common Mistakes" optional>
          <Textarea
            rows={4}
            value={values.commonMistakes}
            onChange={(e) => set("commonMistakes", e.target.value)}
            placeholder={"- Grading before balancing exposure\n- LUT at 100%"}
          />
        </Field>
        <Field label="Troubleshooting" optional>
          <Textarea
            rows={4}
            value={values.troubleshooting}
            onChange={(e) => set("troubleshooting", e.target.value)}
            placeholder="Banding in skies? Add subtle grain…"
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Keyboard Shortcuts" optional>
            <Textarea
              rows={4}
              value={values.keyboardShortcuts}
              onChange={(e) => set("keyboardShortcuts", e.target.value)}
              placeholder={"Split: Ctrl/Cmd + B\nUndo: Ctrl/Cmd + Z"}
            />
          </Field>
          <Field label="Alternative Methods" optional>
            <Textarea
              rows={4}
              value={values.alternativeMethods}
              onChange={(e) => set("alternativeMethods", e.target.value)}
              placeholder="You can build the grade manually with curves…"
            />
          </Field>
        </div>
        <Field label="Final Checklist" hint="Tick these before export." optional>
          <ChecklistEditor
            value={values.finalChecklist}
            onChange={(v) => set("finalChecklist", v)}
          />
        </Field>

        {assets.length > 0 && (
          <Field label="Linked Assets" hint="Connect assets from your library." optional>
            <div className="flex flex-wrap gap-2">
              {assets.map((a) => {
                const on = values.linkedAssetIds.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() =>
                      set(
                        "linkedAssetIds",
                        on
                          ? values.linkedAssetIds.filter((id) => id !== a.id)
                          : [...values.linkedAssetIds, a.id]
                      )
                    }
                    className={`rounded-lg border px-2.5 py-1.5 text-[12.5px] font-medium transition-all ${
                      on
                        ? "border-ink bg-ink text-white"
                        : "border-line bg-canvas text-muted hover:border-ink/30 hover:text-ink"
                    }`}
                  >
                    {a.name}
                  </button>
                );
              })}
            </div>
          </Field>
        )}
      </Section>
    </form>
  );
}
