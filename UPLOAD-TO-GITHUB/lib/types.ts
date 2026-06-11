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
export type Workspace = "editing" | "academic" | "ielts";

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

// ---------------------------------------------------------------------------
// IELTS 30-Day Comeback Challenge
// ---------------------------------------------------------------------------

export type IeltsStatus = "active" | "completed" | "archived";

/** One 30-day challenge attempt. Users can run several over time. */
export interface IeltsChallenge {
  id: string;
  /** auto-generated: IELTS-0001 */
  serial: string;
  studentName: string;
  targetBand: string;
  /** ISO date (yyyy-mm-dd) or "" */
  startDate: string;
  targetDate: string;
  status: IeltsStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IeltsListening {
  source: string;
  /** raw score out of 40, kept as text ("31") */
  score: string;
  wrong: string;
  errorTypes: string[];
  wrongQuestions: string;
  lesson: string;
}

export interface IeltsReading {
  source: string;
  score: string;
  wrong: string;
  missedTypes: string[];
  lesson: string;
}

export interface IeltsWriting {
  /** task type is derived from the day number (odd → Task 1, even → Task 2) */
  estBand: string;
  vocabUsed: string;
  analyse: string[];
  lesson: string;
}

export interface IeltsSpeaking {
  source: string;
  topic1: string;
  topic2: string;
  identified: string[];
  lesson: string;
}

export interface IeltsVocabWord {
  word: string;
  meaning: string;
  example: string;
}

export interface IeltsReflection {
  bestModule: string;
  weakestModule: string;
  commonMistake: string;
  learned: string;
  improve: string;
}

/** The 5-checkbox Success Rule — a day counts only when all five are true. */
export interface IeltsDayDone {
  listening: boolean;
  reading: boolean;
  writing: boolean;
  speaking: boolean;
  reflection: boolean;
}

/** One tracked day of a challenge (created lazily on first save). */
export interface IeltsDay {
  id: string;
  challengeId: string;
  /** 1..30 */
  dayNumber: number;
  /** ISO date or "" */
  date: string;
  listening: IeltsListening;
  reading: IeltsReading;
  writing: IeltsWriting;
  speaking: IeltsSpeaking;
  /** exactly 5 slots in the UI; stored as-is */
  vocabulary: IeltsVocabWord[];
  reflection: IeltsReflection;
  done: IeltsDayDone;
  updatedAt: string;
}
