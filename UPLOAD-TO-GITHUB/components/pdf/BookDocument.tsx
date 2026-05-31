"use client";

import * as React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Tutorial } from "@/lib/types";

/**
 * The "published handbook" PDF. Cover → Table of Contents → Chapters → footer
 * with page numbers. Uses the built-in Helvetica so it renders reliably with
 * zero font registration / network dependency.
 */

const ink = "#111111";
const muted = "#666666";
const line = "#E5E5E5";

const s = StyleSheet.create({
  page: {
    paddingTop: 64,
    paddingBottom: 64,
    paddingHorizontal: 64,
    fontSize: 11,
    color: ink,
    fontFamily: "Helvetica",
    lineHeight: 1.5,
  },
  // cover
  cover: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 64,
  },
  coverKicker: {
    fontSize: 10,
    letterSpacing: 2,
    color: muted,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  coverTitle: {
    fontSize: 34,
    fontFamily: "Helvetica-Bold",
    lineHeight: 1.15,
    marginBottom: 24,
  },
  coverRule: { height: 1, backgroundColor: ink, width: 60, marginBottom: 24 },
  coverMeta: { fontSize: 12, color: muted, marginBottom: 4 },
  // toc
  h1: { fontSize: 20, fontFamily: "Helvetica-Bold", marginBottom: 20 },
  tocRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 10,
  },
  tocSerial: { fontSize: 10, color: muted, width: 56 },
  tocName: { fontSize: 12, color: ink },
  tocDots: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: line,
    borderBottomStyle: "dotted",
    marginHorizontal: 6,
    marginBottom: 3,
  },
  tocPage: { fontSize: 11, color: muted },
  // chapter
  chSerial: { fontSize: 9, color: muted, letterSpacing: 1.5, marginBottom: 4 },
  chTitle: { fontSize: 22, fontFamily: "Helvetica-Bold", marginBottom: 8 },
  chAccent: { height: 2, backgroundColor: ink, width: 40, marginBottom: 16 },
  goal: { fontSize: 12, color: muted, marginBottom: 18 },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: muted,
    marginTop: 14,
    marginBottom: 6,
  },
  body: { fontSize: 11, color: "#222222", marginBottom: 3 },
  bullet: { flexDirection: "row", marginBottom: 3, paddingLeft: 4 },
  bulletDot: { width: 10, fontSize: 11, color: muted },
  // timeline
  timeline: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 4 },
  timelineStep: {
    borderWidth: 1,
    borderColor: line,
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 7,
    fontSize: 9,
    color: ink,
    marginRight: 6,
    marginBottom: 6,
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 64,
    right: 64,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: line,
    paddingTop: 8,
    fontSize: 9,
    color: muted,
  },
  checkItem: { flexDirection: "row", marginBottom: 3 },
  checkBox: { fontSize: 10, color: muted, width: 12 },
});

function Footer() {
  return (
    <View style={s.footer} fixed>
      <Text>TUTORIAL Knowledge Vault</Text>
      <Text
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      />
    </View>
  );
}

/** Render the markdown-subset step body into PDF primitives. */
function PdfBody({ source }: { source: string }) {
  if (!source?.trim()) return null;
  const lines = source.split("\n");
  const out: React.ReactNode[] = [];
  let key = 0;
  for (const raw of lines) {
    const t = raw.trim();
    if (!t) continue;
    if (t.startsWith("## ")) {
      out.push(
        <Text key={key++} style={s.sectionLabel}>
          {t.slice(3)}
        </Text>
      );
    } else if (/^[-*•]\s+/.test(t)) {
      out.push(
        <View key={key++} style={s.bullet}>
          <Text style={s.bulletDot}>•</Text>
          <Text style={s.body}>{t.replace(/^[-*•]\s+/, "").replace(/\*\*/g, "")}</Text>
        </View>
      );
    } else if (/^\d+\.\s+/.test(t)) {
      const num = t.match(/^(\d+)\./)?.[1] ?? "•";
      out.push(
        <View key={key++} style={s.bullet}>
          <Text style={s.bulletDot}>{num}.</Text>
          <Text style={s.body}>{t.replace(/^\d+\.\s+/, "").replace(/\*\*/g, "")}</Text>
        </View>
      );
    } else {
      out.push(
        <Text key={key++} style={s.body}>
          {t.replace(/\*\*/g, "")}
        </Text>
      );
    }
  }
  return <>{out}</>;
}

export function BookDocument({
  tutorials,
  bookTitle,
  authorName,
  dateLabel,
}: {
  tutorials: Tutorial[];
  bookTitle: string;
  authorName: string;
  dateLabel: string;
}) {
  return (
    <Document title={bookTitle} author={authorName}>
      {/* Cover */}
      <Page size="A4" style={s.page}>
        <View style={s.cover}>
          <Text style={s.coverKicker}>The Creator&apos;s Encyclopedia</Text>
          <Text style={s.coverTitle}>{bookTitle}</Text>
          <View style={s.coverRule} />
          <Text style={s.coverMeta}>By {authorName}</Text>
          <Text style={s.coverMeta}>{dateLabel}</Text>
          <Text style={[s.coverMeta, { marginTop: 24 }]}>
            {tutorials.length} tutorials
          </Text>
        </View>
        <Footer />
      </Page>

      {/* Table of contents */}
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>Table of Contents</Text>
        {tutorials.map((t, i) => (
          <View key={t.id} style={s.tocRow}>
            <Text style={s.tocSerial}>{t.serial}</Text>
            <Text style={s.tocName}>{t.name}</Text>
            <View style={s.tocDots} />
            <Text style={s.tocPage}>Ch. {i + 1}</Text>
          </View>
        ))}
        <Footer />
      </Page>

      {/* Chapters */}
      {tutorials.map((t) => (
        <Page key={t.id} size="A4" style={s.page} break>
          <Text style={s.chSerial}>{t.serial}</Text>
          <Text style={s.chTitle}>{t.name}</Text>
          <View style={s.chAccent} />
          {t.goal ? <Text style={s.goal}>{t.goal}</Text> : null}

          {t.workflow.length > 0 && (
            <>
              <Text style={s.sectionLabel}>Workflow</Text>
              <View style={s.timeline}>
                {t.workflow.map((w, i) => (
                  <Text key={w.id} style={s.timelineStep}>
                    {i + 1}. {w.label}
                  </Text>
                ))}
              </View>
            </>
          )}

          {t.finalResult ? (
            <>
              <Text style={s.sectionLabel}>Final Result</Text>
              <Text style={s.body}>{t.finalResult}</Text>
            </>
          ) : null}

          {t.beforeYouStart ? (
            <>
              <Text style={s.sectionLabel}>Before You Start</Text>
              <Text style={s.body}>{t.beforeYouStart}</Text>
            </>
          ) : null}

          <Text style={s.sectionLabel}>Step-by-Step Workflow</Text>
          <PdfBody source={t.steps} />

          {t.commonMistakes ? (
            <>
              <Text style={s.sectionLabel}>Common Mistakes</Text>
              <PdfBody source={t.commonMistakes} />
            </>
          ) : null}

          {t.troubleshooting ? (
            <>
              <Text style={s.sectionLabel}>Troubleshooting</Text>
              <Text style={s.body}>{t.troubleshooting}</Text>
            </>
          ) : null}

          {t.keyboardShortcuts ? (
            <>
              <Text style={s.sectionLabel}>Keyboard Shortcuts</Text>
              <Text style={s.body}>{t.keyboardShortcuts}</Text>
            </>
          ) : null}

          {t.finalChecklist.length > 0 && (
            <>
              <Text style={s.sectionLabel}>Final Checklist</Text>
              {t.finalChecklist.map((c, i) => (
                <View key={i} style={s.checkItem}>
                  <Text style={s.checkBox}>{"☐"}</Text>
                  <Text style={s.body}>{c}</Text>
                </View>
              ))}
            </>
          )}

          <Footer />
        </Page>
      ))}
    </Document>
  );
}
