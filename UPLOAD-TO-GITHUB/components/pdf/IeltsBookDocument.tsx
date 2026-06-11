"use client";

import * as React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { IeltsChallenge, IeltsDay } from "@/lib/types";
import {
  completedCount,
  currentStreak,
  dayHasData,
  emptyIeltsDay,
  IELTS_TOTAL_DAYS,
  isDayComplete,
  LISTENING_ERROR_TYPES,
  READING_MISSED_TYPES,
  SPEAKING_IDENTIFY,
  WRITING_ANALYSE,
  writingTaskLabel,
} from "@/lib/ielts";
import { PDF_FONT, registerPdfFonts } from "@/lib/pdfFonts";

/**
 * The "30-Day IELTS Comeback Challenge" book — a filled-in digital twin of the
 * printed tracker. Cover → progress grid → one chapter per tracked day.
 * Uses the Bengali-capable font so meanings written in Bangla render correctly.
 */

registerPdfFonts();

const ink = "#111111";
const muted = "#666666";
const line = "#E5E5E5";
const crimson = "#be123c";

const s = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 64,
    paddingHorizontal: 56,
    fontSize: 10,
    color: ink,
    fontFamily: PDF_FONT,
    lineHeight: 1.45,
  },
  cover: { flex: 1, justifyContent: "center", paddingHorizontal: 56 },
  coverKicker: {
    fontSize: 10,
    letterSpacing: 2,
    color: crimson,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  coverTitle: {
    fontSize: 30,
    fontFamily: PDF_FONT, fontWeight: "bold",
    lineHeight: 1.15,
    marginBottom: 20,
  },
  coverRule: { height: 2, backgroundColor: crimson, width: 60, marginBottom: 20 },
  coverMeta: { fontSize: 11, color: muted, marginBottom: 4 },
  h1: { fontSize: 18, fontFamily: PDF_FONT, fontWeight: "bold", marginBottom: 16 },
  // progress grid
  gridWrap: { flexDirection: "row", flexWrap: "wrap" },
  gridCell: {
    width: 88,
    borderWidth: 1,
    borderColor: line,
    borderRadius: 4,
    padding: 5,
    marginRight: 6,
    marginBottom: 6,
  },
  gridCellDone: { backgroundColor: "#fff1f2", borderColor: crimson },
  gridDay: { fontSize: 9, fontFamily: PDF_FONT, fontWeight: "bold", marginBottom: 2 },
  gridMods: { flexDirection: "row" },
  gridMod: { fontSize: 7, color: muted, marginRight: 5 },
  gridModOn: { color: crimson, fontFamily: PDF_FONT, fontWeight: "bold" },
  // chapters
  chKicker: { fontSize: 8, color: crimson, letterSpacing: 1.5, marginBottom: 2 },
  chTitle: { fontSize: 19, fontFamily: PDF_FONT, fontWeight: "bold", marginBottom: 3 },
  chMeta: { fontSize: 9.5, color: muted, marginBottom: 10 },
  chAccent: { height: 2, backgroundColor: crimson, width: 36, marginBottom: 12 },
  partTitle: {
    fontSize: 10.5,
    fontFamily: PDF_FONT, fontWeight: "bold",
    color: crimson,
    marginTop: 12,
    marginBottom: 5,
  },
  row: { flexDirection: "row", marginBottom: 2 },
  label: { fontSize: 9, color: muted, width: 130 },
  value: { fontSize: 9.5, color: ink, flex: 1 },
  checksWrap: { flexDirection: "row", flexWrap: "wrap", marginTop: 2, marginBottom: 2 },
  check: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: line,
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 5,
    marginRight: 4,
    marginBottom: 4,
  },
  checkOn: { backgroundColor: "#fff1f2", borderColor: crimson },
  checkBox: {
    width: 7,
    height: 7,
    borderWidth: 1,
    borderColor: muted,
    marginRight: 4,
    borderRadius: 1.5,
  },
  checkBoxOn: { backgroundColor: crimson, borderColor: crimson },
  checkLabel: { fontSize: 8 },
  lesson: {
    fontSize: 9.5,
    color: ink,
    backgroundColor: "#FAFAFA",
    borderLeftWidth: 2,
    borderLeftColor: crimson,
    paddingVertical: 3,
    paddingHorizontal: 6,
    marginTop: 2,
  },
  vocabRow: { flexDirection: "row", marginBottom: 3 },
  vocabWord: { fontSize: 9.5, fontFamily: PDF_FONT, fontWeight: "bold", width: 90 },
  vocabMeaning: { fontSize: 9.5, width: 150, paddingRight: 6 },
  vocabExample: { fontSize: 9, color: muted, flex: 1 },
  successWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: line,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 56,
    right: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: line,
    paddingTop: 7,
    fontSize: 8,
    color: muted,
  },
});

function Footer() {
  return (
    <View style={s.footer} fixed>
      <Text>30-Day IELTS Comeback Challenge - No Module Skipped, No Day Wasted</Text>
      <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}

function Checks({
  options,
  on,
}: {
  options: readonly string[];
  on: string[];
}) {
  return (
    <View style={s.checksWrap}>
      {options.map((opt) => {
        const active = on.includes(opt);
        return (
          <View key={opt} style={active ? [s.check, s.checkOn] : s.check}>
            <View style={active ? [s.checkBox, s.checkBoxOn] : s.checkBox} />
            <Text style={s.checkLabel}>{opt}</Text>
          </View>
        );
      })}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.row}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{value || "-"}</Text>
    </View>
  );
}

function Lesson({ text }: { text: string }) {
  if (!text.trim()) return null;
  return <Text style={s.lesson}>{text}</Text>;
}

export function IeltsBookDocument({
  challenge,
  days,
  authorName,
  dateLabel,
}: {
  challenge: IeltsChallenge;
  days: IeltsDay[];
  authorName: string;
  dateLabel: string;
}) {
  const byNumber = new Map(days.map((d) => [d.dayNumber, d]));
  const tracked = days.filter(dayHasData).sort((a, b) => a.dayNumber - b.dayNumber);
  const done = completedCount(days);
  const streak = currentStreak(days);

  return (
    <Document
      title={`IELTS Comeback Challenge - ${challenge.serial}`}
      author={authorName}
    >
      {/* Cover */}
      <Page size="A4" style={s.page}>
        <View style={s.cover}>
          <Text style={s.coverKicker}>Daily Performance Tracker</Text>
          <Text style={s.coverTitle}>30-Day IELTS{"\n"}Comeback Challenge</Text>
          <View style={s.coverRule} />
          <Text style={s.coverMeta}>
            Student: {challenge.studentName || authorName || "-"}
          </Text>
          <Text style={s.coverMeta}>
            Target Band: {challenge.targetBand || "-"}
          </Text>
          <Text style={s.coverMeta}>
            Start Date: {challenge.startDate || "-"}
            {challenge.targetDate ? `   |   Target Date: ${challenge.targetDate}` : ""}
          </Text>
          <Text style={[s.coverMeta, { marginTop: 18 }]}>
            {done}/{IELTS_TOTAL_DAYS} days complete, current streak {streak}
          </Text>
          <Text style={s.coverMeta}>Exported {dateLabel}</Text>
          <Text style={[s.coverMeta, { marginTop: 18, color: crimson }]}>
            No Module Skipped | No Day Wasted | No Excuse Accepted
          </Text>
        </View>
        <Footer />
      </Page>

      {/* Progress grid */}
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>30-Day Progress Grid</Text>
        <View style={s.gridWrap}>
          {Array.from({ length: IELTS_TOTAL_DAYS }, (_, i) => i + 1).map((n) => {
            const d = byNumber.get(n);
            const complete = d ? isDayComplete(d) : false;
            const mods: { k: keyof IeltsDay["done"]; t: string }[] = [
              { k: "listening", t: "L" },
              { k: "reading", t: "R" },
              { k: "writing", t: "W" },
              { k: "speaking", t: "S" },
            ];
            return (
              <View
                key={n}
                style={complete ? [s.gridCell, s.gridCellDone] : s.gridCell}
              >
                <Text style={s.gridDay}>Day {n}</Text>
                <View style={s.gridMods}>
                  {mods.map(({ k, t }) => (
                    <Text
                      key={k}
                      style={d?.done[k] ? [s.gridMod, s.gridModOn] : s.gridMod}
                    >
                      {d?.done[k] ? `[x] ${t}` : `[ ] ${t}`}
                    </Text>
                  ))}
                </View>
              </View>
            );
          })}
        </View>
        <Footer />
      </Page>

      {/* Day chapters — only days with any entry */}
      {tracked.map((raw) => {
        const d = { ...emptyIeltsDay(raw.challengeId, raw.dayNumber), ...raw };
        return (
          <Page key={d.dayNumber} size="A4" style={s.page}>
            <Text style={s.chKicker}>
              30-DAY IELTS COMEBACK CHALLENGE
            </Text>
            <Text style={s.chTitle}>
              Day {String(d.dayNumber).padStart(2, "0")}
              {isDayComplete(d) ? "  [COMPLETE]" : ""}
            </Text>
            <Text style={s.chMeta}>
              {d.date ? `Date: ${d.date}` : "Date: -"}
            </Text>
            <View style={s.chAccent} />

            {/* Listening */}
            <Text style={s.partTitle}>PART 1: LISTENING (30-40 min)</Text>
            <Row label="Test Source" value={d.listening.source} />
            <Row
              label="Score"
              value={d.listening.score ? `${d.listening.score} / 40` : ""}
            />
            <Row label="Wrong" value={d.listening.wrong} />
            <Checks options={LISTENING_ERROR_TYPES} on={d.listening.errorTypes} />
            <Row label="Questions Wrong" value={d.listening.wrongQuestions} />
            <Lesson text={d.listening.lesson} />

            {/* Reading */}
            <Text style={s.partTitle}>PART 2: READING (30-40 min)</Text>
            <Row label="Test Source" value={d.reading.source} />
            <Row
              label="Score"
              value={d.reading.score ? `${d.reading.score} / 40` : ""}
            />
            <Row label="Wrong" value={d.reading.wrong} />
            <Checks options={READING_MISSED_TYPES} on={d.reading.missedTypes} />
            <Lesson text={d.reading.lesson} />

            {/* Writing */}
            <Text style={s.partTitle}>PART 3: WRITING (40 min)</Text>
            <Row label="Task Type" value={writingTaskLabel(d.dayNumber)} />
            <Row
              label="Est. Band"
              value={d.writing.estBand ? `Band ${d.writing.estBand}` : ""}
            />
            <Row label="New Vocabulary Used" value={d.writing.vocabUsed} />
            <Checks options={WRITING_ANALYSE} on={d.writing.analyse} />
            <Lesson text={d.writing.lesson} />

            {/* Speaking */}
            <Text style={s.partTitle}>PART 4: SPEAKING (30 min)</Text>
            <Row label="Test Source (Makkar)" value={d.speaking.source} />
            <Row label="Test 1 Topic" value={d.speaking.topic1} />
            <Row label="Test 2 Topic" value={d.speaking.topic2} />
            <Checks options={SPEAKING_IDENTIFY} on={d.speaking.identified} />
            <Lesson text={d.speaking.lesson} />

            {/* Vocabulary */}
            <Text style={s.partTitle}>PART 5: VOCABULARY (15 min)</Text>
            {d.vocabulary.filter((v) => v.word || v.meaning || v.example).length ? (
              d.vocabulary
                .filter((v) => v.word || v.meaning || v.example)
                .map((v, i) => (
                  <View key={i} style={s.vocabRow}>
                    <Text style={s.vocabWord}>{v.word || "-"}</Text>
                    <Text style={s.vocabMeaning}>{v.meaning}</Text>
                    <Text style={s.vocabExample}>{v.example}</Text>
                  </View>
                ))
            ) : (
              <Text style={{ fontSize: 9, color: muted }}>-</Text>
            )}

            {/* Reflection */}
            <Text style={s.partTitle}>PART 6: DAILY REFLECTION (10 min)</Text>
            <Row label="Best Module" value={d.reflection.bestModule} />
            <Row label="Weakest Module" value={d.reflection.weakestModule} />
            <Row label="Most Common Mistake" value={d.reflection.commonMistake} />
            <Row label="What Did I Learn?" value={d.reflection.learned} />
            <Row label="Improve Tomorrow" value={d.reflection.improve} />

            {/* Success rule */}
            <View style={s.successWrap}>
              <Checks
                options={[
                  "Listening Done",
                  "Reading Done",
                  "Writing Done",
                  "Speaking Done",
                  "Reflection Done",
                ]}
                on={[
                  d.done.listening ? "Listening Done" : "",
                  d.done.reading ? "Reading Done" : "",
                  d.done.writing ? "Writing Done" : "",
                  d.done.speaking ? "Speaking Done" : "",
                  d.done.reflection ? "Reflection Done" : "",
                ].filter(Boolean)}
              />
            </View>
            <Footer />
          </Page>
        );
      })}
    </Document>
  );
}
