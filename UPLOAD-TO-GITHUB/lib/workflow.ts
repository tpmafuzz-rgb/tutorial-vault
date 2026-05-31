import type { WorkflowStep } from "./types";
import { uid } from "./utils";

/**
 * Auto-generate the visual workflow timeline from the step body.
 * Maps editing action keywords to clean, canonical timeline stages so every
 * tutorial gets a beautiful timeline without manual effort.
 */
export function buildWorkflowFromSteps(steps: string): WorkflowStep[] {
  const text = steps.toLowerCase();
  const map: [RegExp, string][] = [
    [/import|upload|bring in|ingest/, "Import Clips"],
    [/organize|arrange|sort|label/, "Organize Footage"],
    [/trim|cut|split|slice/, "Trim & Cut"],
    [/color|grade|lut|balance|exposure/, "Color Grade"],
    [/animate|keyframe|motion|effect|transition/, "Add Motion Effects"],
    [/sound|audio|music|sfx|duck|mix/, "Add Sound Design"],
    [/export|render|output|deliver/, "Export"],
  ];

  const labels: string[] = [];
  for (const [re, label] of map) {
    if (re.test(text) && !labels.includes(label)) labels.push(label);
  }

  if (labels.length === 0) {
    labels.push("Prepare", "Edit", "Polish", "Export");
  }

  return labels.map((label) => ({ id: uid("w"), label }));
}
