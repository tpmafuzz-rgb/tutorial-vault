import type { LucideIcon } from "lucide-react";
import {
  Sparkles,
  Layers,
  Search,
  BookOpen,
  GraduationCap,
} from "lucide-react";

/** Welcome screens (Steps 1-3). Extend this array to add more — the UI adapts. */
export interface WelcomeSlide {
  icon: LucideIcon;
  kicker: string;
  title: string;
  body: string;
  bullets?: string[];
}

export const WELCOME_SLIDES: WelcomeSlide[] = [
  {
    icon: Sparkles,
    kicker: "Welcome",
    title: "One home for everything you learn",
    body: "TUTORIAL is your private vault for the things you learn — so you never lose a technique or a study note again.",
  },
  {
    icon: Layers,
    kicker: "Two workspaces in one app",
    title: "🎬 Editing  +  🎓 Academic",
    body: "TUTORIAL has two sides, and you switch between them with one tap. Use whichever fits what you're saving.",
    bullets: [
      "🎬 Editing — save video-editing tutorials, step by step",
      "🎓 Academic — write study notes freely, then label your own sections",
      "Each mode has its own look, and everything stays auto-numbered & tidy",
    ],
  },
  {
    icon: GraduationCap,
    kicker: "How you'll use it",
    title: "Capture · Organize · Find · Export",
    body: "Save what you learn, organize it by category or subject, find anything instantly, and turn it all into a polished PDF book whenever you like.",
  },
];

/** Interactive tour stops (Step 4). `selector` targets a real element. */
export interface TourStop {
  selector: string;
  icon: LucideIcon;
  title: string;
  body: string;
  /** preferred tooltip placement relative to the target */
  placement?: "top" | "bottom" | "left" | "right";
}

/**
 * The tour adapts to the current workspace via the {isAcademic} wording, but
 * the targeted elements exist in both modes.
 */
export function buildTourStops(isAcademic: boolean): TourStop[] {
  return [
    {
      selector: '[data-tour="workspace-toggle"]',
      icon: Layers,
      title: "Switch between Editing & Academic",
      body: isAcademic
        ? "You're in Academic mode now — a blank canvas for study notes. Tap Editing here to switch to video-editing tutorials. The whole app re-themes."
        : "This is the heart of the app. Tap Academic here to switch to a blank-canvas notes workspace for studying — the app turns scholarly-blue. Tap Editing to come back.",
      placement: "bottom",
    },
    {
      selector: '[data-tour="new-button"]',
      icon: Sparkles,
      title: isAcademic ? "Create a note" : "Create a tutorial",
      body: isAcademic
        ? "Start a blank note, write freely, then label each section your own way."
        : "Save a new editing technique using the structured step-by-step template.",
      placement: "bottom",
    },
    {
      selector: '[data-tour="search"]',
      icon: Search,
      title: "Find anything instantly",
      body: "Search across everything you've saved. Tip: press Ctrl/Cmd + K from anywhere.",
      placement: "bottom",
    },
    {
      selector: '[data-tour="sidebar"]',
      icon: Layers,
      title: "Your navigation",
      body: isAcademic
        ? "Jump to your Notes, Favorites, and Book Export from here."
        : "Your Tutorials, Assets, Categories, Favorites and more live here.",
      placement: "right",
    },
    {
      selector: '[data-tour="export"]',
      icon: BookOpen,
      title: "Export a book",
      body: "Turn everything into a professional PDF handbook — cover, contents, and page numbers included.",
      placement: "right",
    },
  ];
}
