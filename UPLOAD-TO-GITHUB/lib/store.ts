"use client";

import { create } from "zustand";
import type {
  Asset,
  AssetType,
  Category,
  Difficulty,
  Note,
  NoteBlock,
  Profile,
  Tutorial,
  Workspace,
  WorkflowStep,
} from "./types";
import { createClient } from "./supabase/client";
import {
  rowToAsset,
  rowToCategory,
  rowToNote,
  rowToProfile,
  rowToTutorial,
  type AssetRow,
  type CategoryRow,
  type NoteRow,
  type ProfileRow,
  type TutorialRow,
} from "./supabase/types";

export interface NewTutorialInput {
  name: string;
  goal: string;
  finalResult: string;
  software: string[];
  difficulty: Difficulty;
  categoryId: string | null;
  assetsRequired: string[];
  beforeYouStart: string;
  steps: string;
  commonMistakes: string;
  troubleshooting: string;
  keyboardShortcuts: string;
  alternativeMethods: string;
  finalChecklist: string[];
  workflow: WorkflowStep[];
  linkedAssetIds: string[];
}

export interface NewNoteInput {
  title: string;
  subject: string;
  level: string;
  blocks: NoteBlock[];
}

/** camelCase domain → snake_case columns for tutorials. */
function tutorialToRow(input: Partial<NewTutorialInput>) {
  const row: Record<string, unknown> = {};
  if (input.name !== undefined) row.name = input.name;
  if (input.goal !== undefined) row.goal = input.goal;
  if (input.finalResult !== undefined) row.final_result = input.finalResult;
  if (input.software !== undefined) row.software = input.software;
  if (input.difficulty !== undefined) row.difficulty = input.difficulty;
  if (input.categoryId !== undefined) row.category_id = input.categoryId;
  if (input.assetsRequired !== undefined)
    row.assets_required = input.assetsRequired;
  if (input.beforeYouStart !== undefined)
    row.before_you_start = input.beforeYouStart;
  if (input.steps !== undefined) row.steps = input.steps;
  if (input.commonMistakes !== undefined)
    row.common_mistakes = input.commonMistakes;
  if (input.troubleshooting !== undefined)
    row.troubleshooting = input.troubleshooting;
  if (input.keyboardShortcuts !== undefined)
    row.keyboard_shortcuts = input.keyboardShortcuts;
  if (input.alternativeMethods !== undefined)
    row.alternative_methods = input.alternativeMethods;
  if (input.finalChecklist !== undefined)
    row.final_checklist = input.finalChecklist;
  if (input.workflow !== undefined) row.workflow = input.workflow;
  return row;
}

interface VaultState {
  loaded: boolean;
  loading: boolean;
  error: string | null;
  userId: string | null;

  /** which side of the app is active */
  workspace: Workspace;
  setWorkspace: (w: Workspace) => void;

  tutorials: Tutorial[];
  categories: Category[];
  assets: Asset[];
  notes: Note[];
  profile: Profile;
  theme: "light" | "dim";
  pdfExports: number;

  load: () => Promise<void>;

  addTutorial: (input: NewTutorialInput) => Promise<string | null>;
  updateTutorial: (id: string, patch: NewTutorialInput) => Promise<void>;
  deleteTutorial: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;

  // ---- academic notes ----
  addNote: (input: NewNoteInput) => Promise<string | null>;
  updateNote: (id: string, patch: NewNoteInput) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  toggleNoteFavorite: (id: string) => Promise<void>;

  addCategory: (name: string, color: string) => Promise<void>;
  renameCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  addAsset: (asset: {
    name: string;
    type: AssetType;
    tags: string[];
    sizeBytes?: number;
    /** optional binary; uploaded to Supabase Storage when present */
    file?: File;
  }) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;

  setProfile: (patch: Partial<Profile>) => Promise<void>;
  setTheme: (theme: "light" | "dim") => Promise<void>;
  logExport: (bookTitle: string, count: number) => Promise<void>;
}

const emptyProfile: Profile = { authorName: "", bookTitle: "My Editing Encyclopedia" };

/** Sync tutorial<->asset links into a child table by diffing. */
async function syncLinks(
  tutorialId: string,
  userId: string,
  assetIds: string[]
) {
  const supabase = createClient();
  await supabase.from("tutorial_assets").delete().eq("tutorial_id", tutorialId);
  if (assetIds.length) {
    await supabase.from("tutorial_assets").insert(
      assetIds.map((asset_id) => ({
        tutorial_id: tutorialId,
        asset_id,
        user_id: userId,
      }))
    );
  }
}

function noteToRow(input: Partial<NewNoteInput>) {
  const row: Record<string, unknown> = {};
  if (input.title !== undefined) row.title = input.title;
  if (input.subject !== undefined) row.subject = input.subject;
  if (input.level !== undefined) row.level = input.level;
  if (input.blocks !== undefined) row.blocks = input.blocks;
  return row;
}

export const useVault = create<VaultState>()((set, get) => ({
  loaded: false,
  loading: false,
  error: null,
  userId: null,

  workspace: "editing",
  setWorkspace: (w) => {
    set({ workspace: w });
    try {
      localStorage.setItem("tv-workspace", w);
    } catch {
      /* ignore */
    }
  },

  tutorials: [],
  categories: [],
  assets: [],
  notes: [],
  profile: emptyProfile,
  theme: "light",
  pdfExports: 0,

  load: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      set({ loading: false, loaded: true });
      return;
    }

    const [
      { data: tutRows },
      { data: catRows },
      { data: assetRows },
      { data: linkRows },
      { data: noteRows },
      { data: profileRow },
      { count: exportCount },
    ] = await Promise.all([
      supabase.from("tutorials").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("created_at"),
      supabase.from("assets").select("*").order("created_at", { ascending: false }),
      supabase.from("tutorial_assets").select("tutorial_id, asset_id"),
      supabase.from("notes").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("export_logs").select("*", { count: "exact", head: true }),
    ]);

    const links = (linkRows ?? []) as { tutorial_id: string; asset_id: string }[];
    const linksByTutorial = new Map<string, string[]>();
    const linksByAsset = new Map<string, string[]>();
    for (const l of links) {
      (linksByTutorial.get(l.tutorial_id) ?? linksByTutorial.set(l.tutorial_id, []).get(l.tutorial_id)!).push(l.asset_id);
      (linksByAsset.get(l.asset_id) ?? linksByAsset.set(l.asset_id, []).get(l.asset_id)!).push(l.tutorial_id);
    }

    const prof = profileRow as ProfileRow | null;

    let savedWorkspace: Workspace = get().workspace;
    try {
      const w = localStorage.getItem("tv-workspace");
      if (w === "editing" || w === "academic") savedWorkspace = w;
    } catch {
      /* ignore */
    }

    set({
      userId: user.id,
      workspace: savedWorkspace,
      tutorials: ((tutRows ?? []) as TutorialRow[]).map((r) =>
        rowToTutorial(r, linksByTutorial.get(r.id) ?? [])
      ),
      categories: ((catRows ?? []) as CategoryRow[]).map(rowToCategory),
      assets: ((assetRows ?? []) as AssetRow[]).map((r) =>
        rowToAsset(r, linksByAsset.get(r.id) ?? [])
      ),
      notes: ((noteRows ?? []) as NoteRow[]).map(rowToNote),
      profile: prof ? rowToProfile(prof) : emptyProfile,
      theme: prof?.theme ?? "light",
      pdfExports: exportCount ?? 0,
      loaded: true,
      loading: false,
    });
  },

  addTutorial: async (input) => {
    const supabase = createClient();
    const userId = get().userId;
    if (!userId) return null;

    const { data, error } = await supabase
      .from("tutorials")
      .insert({ ...tutorialToRow(input), user_id: userId })
      .select("*")
      .single();
    if (error || !data) {
      set({ error: error?.message ?? "Failed to create tutorial." });
      return null;
    }

    const row = data as TutorialRow;
    await syncLinks(row.id, userId, input.linkedAssetIds);

    const tutorial = rowToTutorial(row, input.linkedAssetIds);
    set((s) => ({
      tutorials: [tutorial, ...s.tutorials],
      assets: s.assets.map((a) =>
        input.linkedAssetIds.includes(a.id)
          ? { ...a, linkedTutorialIds: [...a.linkedTutorialIds, row.id] }
          : a
      ),
    }));
    return row.id;
  },

  updateTutorial: async (id, patch) => {
    const supabase = createClient();
    const userId = get().userId;
    if (!userId) return;

    const { data, error } = await supabase
      .from("tutorials")
      .update(tutorialToRow(patch))
      .eq("id", id)
      .select("*")
      .single();
    if (error || !data) {
      set({ error: error?.message ?? "Failed to save." });
      return;
    }
    await syncLinks(id, userId, patch.linkedAssetIds);

    const tutorial = rowToTutorial(data as TutorialRow, patch.linkedAssetIds);
    set((s) => ({
      tutorials: s.tutorials.map((t) => (t.id === id ? tutorial : t)),
      assets: s.assets.map((a) => ({
        ...a,
        linkedTutorialIds: patch.linkedAssetIds.includes(a.id)
          ? Array.from(new Set([...a.linkedTutorialIds, id]))
          : a.linkedTutorialIds.filter((tid) => tid !== id),
      })),
    }));
  },

  deleteTutorial: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("tutorials").delete().eq("id", id);
    if (error) {
      set({ error: error.message });
      return;
    }
    set((s) => ({
      tutorials: s.tutorials.filter((t) => t.id !== id),
      assets: s.assets.map((a) => ({
        ...a,
        linkedTutorialIds: a.linkedTutorialIds.filter((tid) => tid !== id),
      })),
    }));
  },

  toggleFavorite: async (id) => {
    const current = get().tutorials.find((t) => t.id === id);
    if (!current) return;
    const next = !current.favorite;
    // optimistic
    set((s) => ({
      tutorials: s.tutorials.map((t) =>
        t.id === id ? { ...t, favorite: next } : t
      ),
    }));
    const supabase = createClient();
    const { error } = await supabase
      .from("tutorials")
      .update({ favorite: next })
      .eq("id", id);
    if (error) {
      // revert
      set((s) => ({
        tutorials: s.tutorials.map((t) =>
          t.id === id ? { ...t, favorite: current.favorite } : t
        ),
      }));
    }
  },

  // ---- academic notes ----
  addNote: async (input) => {
    const supabase = createClient();
    const userId = get().userId;
    if (!userId) return null;
    const { data, error } = await supabase
      .from("notes")
      .insert({ ...noteToRow(input), user_id: userId })
      .select("*")
      .single();
    if (error || !data) {
      set({ error: error?.message ?? "Failed to create note." });
      return null;
    }
    const note = rowToNote(data as NoteRow);
    set((s) => ({ notes: [note, ...s.notes] }));
    return note.id;
  },

  updateNote: async (id, patch) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("notes")
      .update(noteToRow(patch))
      .eq("id", id)
      .select("*")
      .single();
    if (error || !data) {
      set({ error: error?.message ?? "Failed to save note." });
      return;
    }
    const note = rowToNote(data as NoteRow);
    set((s) => ({ notes: s.notes.map((n) => (n.id === id ? note : n)) }));
  },

  deleteNote: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) return set({ error: error.message });
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }));
  },

  toggleNoteFavorite: async (id) => {
    const current = get().notes.find((n) => n.id === id);
    if (!current) return;
    const next = !current.favorite;
    set((s) => ({
      notes: s.notes.map((n) => (n.id === id ? { ...n, favorite: next } : n)),
    }));
    const supabase = createClient();
    const { error } = await supabase
      .from("notes")
      .update({ favorite: next })
      .eq("id", id);
    if (error) {
      set((s) => ({
        notes: s.notes.map((n) =>
          n.id === id ? { ...n, favorite: current.favorite } : n
        ),
      }));
    }
  },

  addCategory: async (name, color) => {
    const supabase = createClient();
    const userId = get().userId;
    if (!userId) return;
    const { data, error } = await supabase
      .from("categories")
      .insert({ name, color, user_id: userId })
      .select("*")
      .single();
    if (error || !data) {
      set({ error: error?.message ?? "Failed to create category." });
      return;
    }
    set((s) => ({ categories: [...s.categories, rowToCategory(data as CategoryRow)] }));
  },

  renameCategory: async (id, name) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("categories")
      .update({ name })
      .eq("id", id);
    if (error) return set({ error: error.message });
    set((s) => ({
      categories: s.categories.map((c) => (c.id === id ? { ...c, name } : c)),
    }));
  },

  deleteCategory: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return set({ error: error.message });
    set((s) => ({
      categories: s.categories.filter((c) => c.id !== id),
      tutorials: s.tutorials.map((t) =>
        t.categoryId === id ? { ...t, categoryId: null } : t
      ),
    }));
  },

  addAsset: async (asset) => {
    const supabase = createClient();
    const userId = get().userId;
    if (!userId) throw new Error("Not signed in.");

    // Upload the binary to the private `assets` bucket under {uid}/{uuid}-{name}
    let storagePath: string | null = null;
    if (asset.file) {
      const safe = asset.file.name.replace(/[^\w.\-]/g, "_");
      const path = `${userId}/${crypto.randomUUID()}-${safe}`;
      const { error: upErr } = await supabase.storage
        .from("assets")
        .upload(path, asset.file, { upsert: false });
      if (upErr) throw new Error(upErr.message);
      storagePath = path;
    }

    const { data, error } = await supabase
      .from("assets")
      .insert({
        name: asset.name,
        type: asset.type,
        tags: asset.tags,
        size_bytes: asset.sizeBytes ?? 0,
        storage_path: storagePath,
        user_id: userId,
      })
      .select("*")
      .single();
    if (error || !data) {
      throw new Error(error?.message ?? "Failed to add asset.");
    }
    set((s) => ({ assets: [rowToAsset(data as AssetRow), ...s.assets] }));
  },

  deleteAsset: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("assets").delete().eq("id", id);
    if (error) return set({ error: error.message });
    set((s) => ({
      assets: s.assets.filter((a) => a.id !== id),
      tutorials: s.tutorials.map((t) => ({
        ...t,
        linkedAssetIds: t.linkedAssetIds.filter((aid) => aid !== id),
      })),
    }));
  },

  setProfile: async (patch) => {
    const supabase = createClient();
    const userId = get().userId;
    if (!userId) return;
    const row: Record<string, unknown> = {};
    if (patch.authorName !== undefined) row.author_name = patch.authorName;
    if (patch.bookTitle !== undefined) row.book_title = patch.bookTitle;
    const { error } = await supabase.from("profiles").update(row).eq("id", userId);
    if (error) return set({ error: error.message });
    set((s) => ({ profile: { ...s.profile, ...patch } }));
  },

  setTheme: async (theme) => {
    set({ theme });
    const supabase = createClient();
    const userId = get().userId;
    if (userId) await supabase.from("profiles").update({ theme }).eq("id", userId);
  },

  logExport: async (bookTitle, count) => {
    const supabase = createClient();
    const userId = get().userId;
    if (!userId) return;
    await supabase
      .from("export_logs")
      .insert({ user_id: userId, book_title: bookTitle, tutorial_count: count });
    set((s) => ({ pdfExports: s.pdfExports + 1 }));
  },
}));

// ---- pure search helper (client-side over loaded tutorials) ----

export function searchTutorials(
  tutorials: Tutorial[],
  categories: Category[],
  assets: Asset[],
  q: string
): Tutorial[] {
  const query = q.trim().toLowerCase();
  if (!query) return tutorials;
  const catName = (id: string | null) =>
    categories.find((c) => c.id === id)?.name.toLowerCase() ?? "";
  const assetNames = (ids: string[]) =>
    ids
      .map((id) => assets.find((a) => a.id === id)?.name.toLowerCase() ?? "")
      .join(" ");
  return tutorials.filter((t) => {
    const haystack = [
      t.name,
      t.serial,
      t.goal,
      t.finalResult,
      t.steps,
      t.software.join(" "),
      catName(t.categoryId),
      assetNames(t.linkedAssetIds),
      t.assetsRequired.join(" "),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}

/** Client-side search over academic notes. */
export function searchNotes(notes: Note[], q: string): Note[] {
  const query = q.trim().toLowerCase();
  if (!query) return notes;
  return notes.filter((n) => {
    const haystack = [
      n.title,
      n.serial,
      n.subject,
      n.level,
      n.blocks.map((b) => `${b.label} ${b.content}`).join(" "),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}

/** Distinct section labels the user has used before, most-recent first. */
export function noteLabelSuggestions(notes: Note[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const n of notes) {
    for (const b of n.blocks) {
      const l = b.label.trim();
      if (l && !seen.has(l.toLowerCase())) {
        seen.add(l.toLowerCase());
        out.push(l);
      }
    }
  }
  // a few sensible defaults if the user is brand new
  const defaults = ["Introduction", "Key Terms", "Explanation", "Example", "Summary"];
  for (const d of defaults) {
    if (!seen.has(d.toLowerCase())) out.push(d);
  }
  return out.slice(0, 12);
}
