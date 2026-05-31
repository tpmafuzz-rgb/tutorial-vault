import type { Difficulty, WorkflowStep } from "./types";
import { uid } from "./utils";
import { buildWorkflowFromSteps } from "./workflow";

export interface RefinedTutorial {
  name: string;
  goal: string;
  finalResult: string;
  software: string[];
  difficulty: Difficulty;
  beforeYouStart: string;
  steps: string;
  commonMistakes: string;
  troubleshooting: string;
  keyboardShortcuts: string;
  finalChecklist: string[];
  workflow: WorkflowStep[];
}

const SOFTWARE_DICT = [
  "CapCut",
  "Premiere Pro",
  "Premiere",
  "After Effects",
  "DaVinci Resolve",
  "DaVinci",
  "Final Cut",
  "Photoshop",
  "Illustrator",
  "Blender",
];

const ACTION_VERBS = [
  "import",
  "organize",
  "trim",
  "cut",
  "add",
  "apply",
  "color",
  "grade",
  "animate",
  "keyframe",
  "sync",
  "layer",
  "duck",
  "mask",
  "track",
  "render",
  "export",
  "balance",
  "stabilize",
];

function titleFromText(raw: string): string {
  const firstLine = raw
    .split(/\n+/)
    .map((l) => l.trim())
    .find((l) => l.length > 0);
  if (!firstLine) return "Untitled Tutorial";
  const cleaned = firstLine.replace(/^(how to|tutorial:|guide:)\s*/i, "").trim();
  const short = cleaned.split(/[.!?]/)[0];
  return (short.length > 60 ? short.slice(0, 57) + "…" : short).replace(
    /\b\w/g,
    (c) => c.toUpperCase()
  );
}

function detectSoftware(text: string): string[] {
  const found = new Set<string>();
  const lower = text.toLowerCase();
  for (const sw of SOFTWARE_DICT) {
    if (lower.includes(sw.toLowerCase())) {
      if (sw === "Premiere") found.add("Premiere Pro");
      else if (sw === "DaVinci") found.add("DaVinci Resolve");
      else found.add(sw);
    }
  }
  return [...found];
}

function detectDifficulty(text: string): Difficulty {
  const lower = text.toLowerCase();
  if (/(advanced|expert|complex|node|expression|matte)/.test(lower))
    return "Advanced";
  if (/(beginner|easy|simple|basic|quick)/.test(lower)) return "Beginner";
  return "Intermediate";
}

function sentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3);
}

function toBullets(items: string[]): string {
  return items.map((s) => `- ${s.replace(/^[-*•]\s*/, "")}`).join("\n");
}

/**
 * Local, deterministic refiner. Converts messy transcript / notes into the
 * structured tutorial template — works with zero credentials.
 *
 * PRODUCTION SEAM: in Supabase mode this is replaced by a call to /api/refine,
 * which prompts Claude to return this exact RefinedTutorial shape as JSON and
 * falls back to this function on any failure. The UI never changes.
 */
export function refineTutorial(raw: string): RefinedTutorial {
  const lines = raw
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const allSentences = sentences(raw);

  const mistakeLines = allSentences.filter((s) =>
    /(mistake|don'?t|avoid|never|too (much|loud|slow|fast)|wrong)/i.test(s)
  );
  const troubleLines = allSentences.filter((s) =>
    /(if .* (is|looks|feels|won'?t|doesn'?t)|fix|problem|issue|glitch|stutter|laggy)/i.test(
      s
    )
  );
  const shortcutLines = allSentences.filter((s) =>
    /(ctrl|cmd|command|shortcut|press|hotkey|spacebar|alt \+)/i.test(s)
  );

  const usedForOther = new Set([
    ...mistakeLines,
    ...troubleLines,
    ...shortcutLines,
  ]);

  const stepLines = allSentences.filter(
    (s) =>
      !usedForOther.has(s) &&
      ACTION_VERBS.some((v) => new RegExp(`\\b${v}`, "i").test(s))
  );

  const goalSentence =
    allSentences.find((s) => /(goal|want|create|make|achieve|learn)/i.test(s)) ||
    allSentences[0] ||
    "Recreate this editing technique.";

  const resultSentence =
    allSentences.find((s) => /(result|final|looks like|end up|finished)/i.test(s)) ||
    "A polished, professional result using this technique.";

  const stepsSource = stepLines.length > 0 ? stepLines : allSentences;
  const stepsBody =
    stepLines.length > 0 || allSentences.length > 0
      ? `## Step-by-Step Workflow\n${stepsSource
          .slice(0, 12)
          .map((s, i) => `${i + 1}. ${s.replace(/^[-*•\d.\s]+/, "")}`)
          .join("\n")}`
      : `## Step-by-Step Workflow\n${lines.map((l, i) => `${i + 1}. ${l}`).join("\n")}`;

  const checklist = stepsSource.slice(0, 4).map((s) => {
    const short = s.replace(/^[-*•\d.\s]+/, "").split(/[,.]/)[0];
    return short.length > 50 ? short.slice(0, 47) + "…" : short;
  });

  return {
    name: titleFromText(raw),
    goal: goalSentence.replace(/^[-*•\s]+/, ""),
    finalResult: resultSentence.replace(/^[-*•\s]+/, ""),
    software: detectSoftware(raw),
    difficulty: detectDifficulty(raw),
    beforeYouStart:
      "Make sure your project and source files are ready before you begin.",
    steps: stepsBody,
    commonMistakes: mistakeLines.length
      ? toBullets(mistakeLines.slice(0, 6))
      : "- Rushing the setup before editing\n- Skipping the final review",
    troubleshooting: troubleLines.length
      ? troubleLines.slice(0, 6).join("\n\n")
      : "If something looks off, undo to the last good state and re-check each step.",
    keyboardShortcuts: shortcutLines.length
      ? shortcutLines.slice(0, 8).join("\n")
      : "Undo: Ctrl/Cmd + Z\nPlay/Pause: Spacebar",
    finalChecklist: checklist.length
      ? checklist
      : ["Reviewed full edit", "Exported at correct settings"],
    workflow:
      buildWorkflowFromSteps(stepsSource.join(" ")) ||
      ([{ id: uid("w"), label: "Edit" }] as WorkflowStep[]),
  };
}
