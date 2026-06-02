"use client";

import * as React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Note } from "@/lib/types";
import { PDF_FONT, registerPdfFonts } from "@/lib/pdfFonts";

/**
 * Academic "Study Notebook" PDF. Cover -> Table of Contents -> one chapter per
 * note (its labeled sections) -> page-numbered footer. Scholarly-blue accent.
 */

// Bengali-capable Unicode font so Bangla notes render correctly (not as mojibake).
registerPdfFonts();

const ink = "#111111";
const muted = "#666666";
const line = "#E5E5E5";
const blue = "#1d4ed8";

const s = StyleSheet.create({
  page: {
    paddingTop: 64,
    paddingBottom: 64,
    paddingHorizontal: 64,
    fontSize: 11,
    color: ink,
    fontFamily: PDF_FONT,
    lineHeight: 1.5,
  },
  cover: { flex: 1, justifyContent: "center", paddingHorizontal: 64 },
  coverKicker: {
    fontSize: 10,
    letterSpacing: 2,
    color: blue,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  coverTitle: { fontSize: 34, fontFamily: PDF_FONT, fontWeight: "bold", lineHeight: 1.15, marginBottom: 24 },
  coverRule: { height: 2, backgroundColor: blue, width: 60, marginBottom: 24 },
  coverMeta: { fontSize: 12, color: muted, marginBottom: 4 },
  h1: { fontSize: 20, fontFamily: PDF_FONT, fontWeight: "bold", marginBottom: 20 },
  tocRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 10 },
  tocSerial: { fontSize: 10, color: muted, width: 64 },
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
  chSerial: { fontSize: 9, color: blue, letterSpacing: 1.5, marginBottom: 4 },
  chTitle: { fontSize: 22, fontFamily: PDF_FONT, fontWeight: "bold", marginBottom: 6 },
  chMeta: { fontSize: 11, color: muted, marginBottom: 14 },
  chAccent: { height: 2, backgroundColor: blue, width: 40, marginBottom: 16 },
  sectionLabel: {
    fontSize: 12,
    fontFamily: PDF_FONT, fontWeight: "bold",
    color: blue,
    marginTop: 14,
    marginBottom: 5,
  },
  body: { fontSize: 11, color: "#222222", marginBottom: 3 },
  bullet: { flexDirection: "row", marginBottom: 3, paddingLeft: 4 },
  bulletDot: { width: 10, fontSize: 11, color: muted },
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
});

function Footer() {
  return (
    <View style={s.footer} fixed>
      <Text>TUTORIAL Study Notebook</Text>
      <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}

/** Render a section's body (markdown subset) into PDF primitives. */
function PdfBody({ source }: { source: string }) {
  if (!source?.trim()) return null;
  const out: React.ReactNode[] = [];
  let key = 0;
  for (const raw of source.split("\n")) {
    const t = raw.trim();
    if (!t) continue;
    if (t.startsWith("## ")) {
      out.push(
        <Text key={key++} style={[s.body, { fontFamily: PDF_FONT, fontWeight: "bold" }]}>
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

export function NoteBookDocument({
  notes,
  bookTitle,
  authorName,
  dateLabel,
}: {
  notes: Note[];
  bookTitle: string;
  authorName: string;
  dateLabel: string;
}) {
  return (
    <Document title={bookTitle} author={authorName}>
      {/* Cover */}
      <Page size="A4" style={s.page}>
        <View style={s.cover}>
          <Text style={s.coverKicker}>Study Notebook</Text>
          <Text style={s.coverTitle}>{bookTitle}</Text>
          <View style={s.coverRule} />
          <Text style={s.coverMeta}>By {authorName}</Text>
          <Text style={s.coverMeta}>{dateLabel}</Text>
          <Text style={[s.coverMeta, { marginTop: 24 }]}>{notes.length} notes</Text>
        </View>
        <Footer />
      </Page>

      {/* Table of contents */}
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>Table of Contents</Text>
        {notes.map((n, i) => (
          <View key={n.id} style={s.tocRow}>
            <Text style={s.tocSerial}>{n.serial}</Text>
            <Text style={s.tocName}>{n.title}</Text>
            <View style={s.tocDots} />
            <Text style={s.tocPage}>Ch. {i + 1}</Text>
          </View>
        ))}
        <Footer />
      </Page>

      {/* Chapters */}
      {notes.map((n) => (
        <Page key={n.id} size="A4" style={s.page} break>
          <Text style={s.chSerial}>{n.serial}</Text>
          <Text style={s.chTitle}>{n.title}</Text>
          {(n.subject || n.level) && (
            <Text style={s.chMeta}>
              {[n.subject, n.level].filter(Boolean).join("  ·  ")}
            </Text>
          )}
          <View style={s.chAccent} />
          {n.blocks
            .filter((b) => b.label.trim() || b.content.trim())
            .map((b) => (
              <View key={b.id}>
                {b.label.trim() ? <Text style={s.sectionLabel}>{b.label}</Text> : null}
                <PdfBody source={b.content} />
              </View>
            ))}
          <Footer />
        </Page>
      ))}
    </Document>
  );
}
