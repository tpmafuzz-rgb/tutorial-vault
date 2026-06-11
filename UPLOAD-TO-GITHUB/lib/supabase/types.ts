/**
 * Row shapes as they exist in Postgres (snake_case), plus mappers to/from the
 * camelCase domain types the UI uses. Keeping this translation in one place
 * means the components never see snake_case and the DB never sees camelCase.
 */
import type {
  Asset,
  AssetType,
  Category,
  Difficulty,
  IeltsChallenge,
  IeltsDay,
  IeltsStatus,
  Note,
  NoteBlock,
  Profile,
  Tutorial,
  WorkflowStep,
} from "@/lib/types";
import { emptyIeltsDay } from "@/lib/ielts";

export interface TutorialRow {
  id: string;
  user_id: string;
  serial: string;
  name: string;
  goal: string;
  final_result: string;
  software: string[];
  difficulty: Difficulty;
  category_id: string | null;
  assets_required: string[];
  before_you_start: string;
  steps: string;
  common_mistakes: string;
  troubleshooting: string;
  keyboard_shortcuts: string;
  alternative_methods: string;
  final_checklist: string[];
  workflow: WorkflowStep[];
  favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryRow {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface AssetRow {
  id: string;
  user_id: string;
  name: string;
  type: AssetType;
  tags: string[];
  size_bytes: number;
  storage_path: string | null;
  created_at: string;
}

export interface ProfileRow {
  id: string;
  author_name: string;
  book_title: string;
  theme: "light" | "dim";
  onboarded: boolean;
}

export interface NoteRow {
  id: string;
  user_id: string;
  serial: string;
  title: string;
  subject: string;
  level: string;
  blocks: NoteBlock[];
  favorite: boolean;
  created_at: string;
  updated_at: string;
}

// ---- mappers ----

export function humanSize(bytes: number): string {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

export function rowToTutorial(
  r: TutorialRow,
  linkedAssetIds: string[] = []
): Tutorial {
  return {
    id: r.id,
    serial: r.serial,
    name: r.name,
    goal: r.goal,
    finalResult: r.final_result,
    software: r.software ?? [],
    difficulty: r.difficulty,
    categoryId: r.category_id,
    assetsRequired: r.assets_required ?? [],
    beforeYouStart: r.before_you_start,
    steps: r.steps,
    commonMistakes: r.common_mistakes,
    troubleshooting: r.troubleshooting,
    keyboardShortcuts: r.keyboard_shortcuts,
    alternativeMethods: r.alternative_methods,
    finalChecklist: (r.final_checklist ?? []) as string[],
    workflow: (r.workflow ?? []) as WorkflowStep[],
    linkedAssetIds,
    favorite: r.favorite,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function rowToCategory(r: CategoryRow): Category {
  return {
    id: r.id,
    name: r.name,
    color: r.color,
    createdAt: r.created_at,
  };
}

export function rowToAsset(r: AssetRow, linkedTutorialIds: string[] = []): Asset {
  return {
    id: r.id,
    name: r.name,
    type: r.type,
    tags: r.tags ?? [],
    size: r.size_bytes ? humanSize(r.size_bytes) : undefined,
    uploadedAt: r.created_at,
    linkedTutorialIds,
  };
}

export function rowToProfile(r: ProfileRow): Profile {
  return {
    authorName: r.author_name,
    bookTitle: r.book_title,
    onboarded: r.onboarded ?? false,
  };
}

export function rowToNote(r: NoteRow): Note {
  return {
    id: r.id,
    serial: r.serial,
    title: r.title,
    subject: r.subject ?? "",
    level: r.level ?? "",
    blocks: (r.blocks ?? []) as NoteBlock[],
    favorite: r.favorite,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// ---- IELTS ----

export interface IeltsChallengeRow {
  id: string;
  user_id: string;
  serial: string;
  student_name: string;
  target_band: string;
  start_date: string;
  target_date: string;
  status: IeltsStatus;
  created_at: string;
  updated_at: string;
}

export interface IeltsDayRow {
  id: string;
  user_id: string;
  challenge_id: string;
  day_number: number;
  date: string;
  listening: Record<string, unknown>;
  reading: Record<string, unknown>;
  writing: Record<string, unknown>;
  speaking: Record<string, unknown>;
  vocabulary: unknown[];
  reflection: Record<string, unknown>;
  done_listening: boolean;
  done_reading: boolean;
  done_writing: boolean;
  done_speaking: boolean;
  done_reflection: boolean;
  created_at: string;
  updated_at: string;
}

export function rowToIeltsChallenge(r: IeltsChallengeRow): IeltsChallenge {
  return {
    id: r.id,
    serial: r.serial,
    studentName: r.student_name ?? "",
    targetBand: r.target_band ?? "",
    startDate: r.start_date ?? "",
    targetDate: r.target_date ?? "",
    status: r.status ?? "active",
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function rowToIeltsDay(r: IeltsDayRow): IeltsDay {
  // merge stored jsonb over a blank day so missing keys get safe defaults
  const blank = emptyIeltsDay(r.challenge_id, r.day_number);
  return {
    ...blank,
    id: r.id,
    date: r.date ?? "",
    listening: { ...blank.listening, ...(r.listening as object) },
    reading: { ...blank.reading, ...(r.reading as object) },
    writing: { ...blank.writing, ...(r.writing as object) },
    speaking: { ...blank.speaking, ...(r.speaking as object) },
    vocabulary:
      Array.isArray(r.vocabulary) && r.vocabulary.length
        ? (r.vocabulary as IeltsDay["vocabulary"])
        : blank.vocabulary,
    reflection: { ...blank.reflection, ...(r.reflection as object) },
    done: {
      listening: r.done_listening,
      reading: r.done_reading,
      writing: r.done_writing,
      speaking: r.done_speaking,
      reflection: r.done_reflection,
    },
    updatedAt: r.updated_at,
  };
}
