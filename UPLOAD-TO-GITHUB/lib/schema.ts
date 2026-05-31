import { z } from "zod";

export const workflowStepSchema = z.object({
  id: z.string(),
  label: z.string().min(1),
});

export const tutorialFormSchema = z.object({
  name: z.string().min(2, "Give your tutorial a name."),
  goal: z.string().min(1, "Describe the goal."),
  finalResult: z.string().default(""),
  software: z.array(z.string()).default([]),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  categoryId: z.string().nullable(),
  assetsRequired: z.array(z.string()).default([]),
  beforeYouStart: z.string().default(""),
  steps: z.string().min(1, "Add at least one step."),
  commonMistakes: z.string().default(""),
  troubleshooting: z.string().default(""),
  keyboardShortcuts: z.string().default(""),
  alternativeMethods: z.string().default(""),
  finalChecklist: z.array(z.string()).default([]),
  workflow: z.array(workflowStepSchema).default([]),
  linkedAssetIds: z.array(z.string()).default([]),
});

export type TutorialFormValues = z.infer<typeof tutorialFormSchema>;
