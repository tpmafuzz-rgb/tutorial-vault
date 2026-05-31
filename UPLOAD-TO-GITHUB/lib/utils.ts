import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Stable-ish id without external deps. */
export function uid(prefix = "id"): string {
  const rand = Math.random().toString(36).slice(2, 9);
  const time = Date.now().toString(36).slice(-4);
  return `${prefix}_${time}${rand}`;
}

/** Format the auto serial: TUT-0001 */
export function formatSerial(n: number): string {
  return `TUT-${String(n).padStart(4, "0")}`;
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function relativeDate(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.round((now - then) / 1000);
  const mins = Math.round(diff / 60);
  const hours = Math.round(diff / 3600);
  const days = Math.round(diff / 86400);
  if (diff < 60) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

export const DIFFICULTY_META: Record<
  string,
  { label: string; dot: string; tone: string }
> = {
  Beginner: { label: "Beginner", dot: "bg-emerald-500", tone: "text-emerald-700" },
  Intermediate: { label: "Intermediate", dot: "bg-amber-500", tone: "text-amber-700" },
  Advanced: { label: "Advanced", dot: "bg-rose-500", tone: "text-rose-700" },
};
