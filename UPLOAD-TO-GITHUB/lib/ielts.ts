import type { IeltsChallenge, IeltsDay, IeltsVocabWord } from "./types";

/**
 * IELTS 30-Day Comeback Challenge — domain constants and helpers.
 * Field structure mirrors the printed "Daily Performance Tracker" sheet:
 * 6 parts per day (Listening, Reading, Writing, Speaking, Vocabulary,
 * Reflection) plus the 5-checkbox Success Rule.
 */

export const IELTS_TOTAL_DAYS = 30;

// PART 1: LISTENING — "Analyse Error Types"
export const LISTENING_ERROR_TYPES = [
  "Spelling Errors",
  "Singular/Plural",
  "Number Errors",
  "Distractors",
  "Unknown Vocab",
  "Lost Concentration",
] as const;

// PART 2: READING — "Question Types Missed"
export const READING_MISSED_TYPES = [
  "T/F/NG",
  "Matching Headings",
  "Match Information",
  "Summary Completion",
  "Vocabulary",
  "Time Management",
] as const;

// PART 3: WRITING — "Analyse"
export const WRITING_ANALYSE = [
  "Grammar",
  "Vocabulary",
  "Coherence",
  "Task Achievement",
  "Paragraphing",
] as const;

// PART 4: SPEAKING — "Identify From Recording"
export const SPEAKING_IDENTIFY = [
  "Hesitation",
  "Repetition",
  "Pronunciation",
  "Grammar Errors",
  "Vocab Weakness",
  "Filler Words",
] as const;

export const SUCCESS_RULE: { key: keyof IeltsDay["done"]; label: string }[] = [
  { key: "listening", label: "Listening Done" },
  { key: "reading", label: "Reading Done" },
  { key: "writing", label: "Writing Done" },
  { key: "speaking", label: "Speaking Done" },
  { key: "reflection", label: "Reflection Done" },
];

/** Writing rotation: odd days → Task 1, even days → Task 2. */
export function writingTaskLabel(dayNumber: number): string {
  return dayNumber % 2 === 1
    ? "Task 1 — Academic / General Writing"
    : "Task 2 — Opinion / Discussion Essay";
}

/** A fresh, blank day (used before the first save). */
export function emptyIeltsDay(challengeId: string, dayNumber: number): IeltsDay {
  return {
    id: "",
    challengeId,
    dayNumber,
    date: "",
    listening: {
      source: "",
      score: "",
      wrong: "",
      errorTypes: [],
      wrongQuestions: "",
      lesson: "",
    },
    reading: { source: "", score: "", wrong: "", missedTypes: [], lesson: "" },
    writing: { estBand: "", vocabUsed: "", analyse: [], lesson: "" },
    speaking: { source: "", topic1: "", topic2: "", identified: [], lesson: "" },
    vocabulary: [
      { word: "", meaning: "", example: "" },
      { word: "", meaning: "", example: "" },
      { word: "", meaning: "", example: "" },
      { word: "", meaning: "", example: "" },
      { word: "", meaning: "", example: "" },
    ],
    reflection: {
      bestModule: "",
      weakestModule: "",
      commonMistake: "",
      learned: "",
      improve: "",
    },
    done: {
      listening: false,
      reading: false,
      writing: false,
      speaking: false,
      reflection: false,
    },
    updatedAt: "",
  };
}

export function isDayComplete(d: IeltsDay): boolean {
  return (
    d.done.listening &&
    d.done.reading &&
    d.done.writing &&
    d.done.speaking &&
    d.done.reflection
  );
}

/** True when the user has entered anything at all for the day. */
export function dayHasData(d: IeltsDay): boolean {
  const l = d.listening, r = d.reading, w = d.writing, s = d.speaking;
  return Boolean(
    d.date ||
      l.source || l.score || l.wrong || l.errorTypes.length || l.wrongQuestions || l.lesson ||
      r.source || r.score || r.wrong || r.missedTypes.length || r.lesson ||
      w.estBand || w.vocabUsed || w.analyse.length || w.lesson ||
      s.source || s.topic1 || s.topic2 || s.identified.length || s.lesson ||
      d.vocabulary.some((v) => v.word || v.meaning || v.example) ||
      d.reflection.bestModule || d.reflection.weakestModule ||
      d.reflection.commonMistake || d.reflection.learned || d.reflection.improve ||
      d.done.listening || d.done.reading || d.done.writing || d.done.speaking ||
      d.done.reflection
  );
}

/**
 * Current streak under the tracker's rule: "each incomplete day resets the
 * habit chain." Scanning day 1→30, a complete day extends the run and any
 * incomplete day before the last complete day resets it.
 */
export function currentStreak(days: IeltsDay[]): number {
  const byNumber = new Map(days.map((d) => [d.dayNumber, d]));
  let lastComplete = 0;
  for (let n = 1; n <= IELTS_TOTAL_DAYS; n++) {
    const d = byNumber.get(n);
    if (d && isDayComplete(d)) lastComplete = n;
  }
  if (lastComplete === 0) return 0;
  let run = 0;
  for (let n = 1; n <= lastComplete; n++) {
    const d = byNumber.get(n);
    run = d && isDayComplete(d) ? run + 1 : 0;
  }
  return run;
}

export function completedCount(days: IeltsDay[]): number {
  return days.filter(isDayComplete).length;
}

/**
 * Approximate raw-score (/40) → band conversion, the common Academic
 * Listening/Reading table. Returns null when the score isn't parseable.
 */
export function rawToBand(score: string): number | null {
  const n = parseInt(String(score).replace(/[^\d]/g, ""), 10);
  if (isNaN(n) || n < 0 || n > 40) return null;
  if (n >= 39) return 9;
  if (n >= 37) return 8.5;
  if (n >= 35) return 8;
  if (n >= 32) return 7.5;
  if (n >= 30) return 7;
  if (n >= 26) return 6.5;
  if (n >= 23) return 6;
  if (n >= 18) return 5.5;
  if (n >= 16) return 5;
  if (n >= 13) return 4.5;
  if (n >= 10) return 4;
  return 3.5;
}

/** Parse the user's estimated writing band ("6.5", "Band 7") → number. */
export function parseBand(input: string): number | null {
  const m = String(input).match(/(\d(?:\.\d)?)/);
  if (!m) return null;
  const b = parseFloat(m[1]);
  return b >= 1 && b <= 9 ? b : null;
}

export interface BandPoint {
  day: number;
  listening: number | null;
  reading: number | null;
  writing: number | null;
}

/** Per-day band points for the trend chart. */
export function bandTrend(days: IeltsDay[]): BandPoint[] {
  return [...days]
    .sort((a, b) => a.dayNumber - b.dayNumber)
    .map((d) => ({
      day: d.dayNumber,
      listening: rawToBand(d.listening.score),
      reading: rawToBand(d.reading.score),
      writing: parseBand(d.writing.estBand),
    }))
    .filter((p) => p.listening !== null || p.reading !== null || p.writing !== null);
}

export interface CollectedWord extends IeltsVocabWord {
  dayNumber: number;
}

/** Every non-empty vocabulary word across the challenge, in day order. */
export function collectVocabulary(days: IeltsDay[]): CollectedWord[] {
  const out: CollectedWord[] = [];
  for (const d of [...days].sort((a, b) => a.dayNumber - b.dayNumber)) {
    for (const v of d.vocabulary) {
      if (v.word.trim() || v.meaning.trim() || v.example.trim()) {
        out.push({ ...v, dayNumber: d.dayNumber });
      }
    }
  }
  return out;
}

/** Default date for a day: challenge start date + (dayNumber - 1). */
export function suggestedDate(c: IeltsChallenge, dayNumber: number): string {
  if (!c.startDate) return "";
  const t = new Date(c.startDate + "T00:00:00");
  if (isNaN(t.getTime())) return "";
  t.setDate(t.getDate() + (dayNumber - 1));
  return t.toISOString().slice(0, 10);
}
