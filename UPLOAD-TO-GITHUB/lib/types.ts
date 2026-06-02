export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export interface Category {
  id: string;
  name: string;
  /** hex accent dot — the only color in the otherwise monochrome UI */
  color: string;
  createdAt: string;
}

export type AssetType =
  | "Font"
  | "LUT"
  | "Preset"
  | "PNG"
  | "Overlay"
  | "Music"
  | "Sound Effect";

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  tags: string[];
  /** display-only size string, e.g. "2.4 MB" */
  size?: string;
  uploadedAt: string;
  /** tutorial ids this asset is linked to */
  linkedTutorialIds: string[];
}

export interface WorkflowStep {
  id: string;
  label: string;
}

/**
 * The structured tutorial template. This is the spine of the entire product —
 * every tutorial is the same shape so the knowledge vault stays consistent.
 */
export interface Tutorial {
  id: string;
  /** auto-generated: TUT-0001 */
  serial: string;
  name: string;
  goal: string;
  finalResult: string;
  software: string[];
  difficulty: Difficulty;
  categoryId: string | null;
  assetsRequired: string[];
  beforeYouStart: string;
  /** markdown-ish rich body for the main workflow */
  steps: string;
  commonMistakes: string;
  troubleshooting: string;
  keyboardShortcuts: string;
  alternativeMethods: string;
  finalChecklist: string[];
  workflow: WorkflowStep[];
  linkedAssetIds: string[];
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  authorName: string;
  bookTitle: string;
  onboarded: boolean;
}

/** Which side of the app is active. */
export type Workspace = "editing" | "academic";

/**
 * One labeled section of an academic note. The user writes freely, then tags
 * the block ("Introduction", "Key Terms", ...). Labels power the auto TOC.
 */
export interface NoteBlock {
  id: string;
  label: string;
  content: string;
}

/**
 * An academic note — a blank canvas organized into labeled blocks, the
 * counterpart to the rigid editing Tutorial template.
 */
export interface Note {
  id: string;
  /** auto-generated: NOTE-0001 */
  serial: string;
  title: string;
  /** free-text subject, e.g. "Biology" */
  subject: string;
  /** free-text level, e.g. "Class 11" (optional) */
  level: string;
  blocks: NoteBlock[];
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}
