"use client";

import * as React from "react";
import type { IeltsDay } from "@/lib/types";
import { bandTrend, parseBand } from "@/lib/ielts";

/**
 * Band trend over the 30 days — Listening & Reading bands derived from the
 * raw /40 scores (approximate official conversion) and the self-estimated
 * Writing band. Pure SVG, no chart library.
 */
export function BandTrend({
  days,
  targetBand,
}: {
  days: IeltsDay[];
  targetBand?: string;
}) {
  const points = bandTrend(days);
  if (points.length === 0) {
    return (
      <p className="text-[13px] text-muted">
        Enter Listening/Reading scores or a Writing band on your day sheets and
        the trend will appear here.
      </p>
    );
  }

  const W = 560;
  const H = 150;
  const PAD = { l: 26, r: 10, t: 8, b: 18 };
  const minBand = 3.5;
  const maxBand = 9;
  const x = (day: number) =>
    PAD.l + ((day - 1) / 29) * (W - PAD.l - PAD.r);
  const y = (band: number) =>
    PAD.t + (1 - (band - minBand) / (maxBand - minBand)) * (H - PAD.t - PAD.b);

  const series: {
    key: "listening" | "reading" | "writing";
    label: string;
    color: string;
  }[] = [
    { key: "listening", label: "Listening", color: "#0ea5e9" },
    { key: "reading", label: "Reading", color: "#10b981" },
    { key: "writing", label: "Writing (est.)", color: "#be123c" },
  ];

  const path = (key: "listening" | "reading" | "writing") => {
    const pts = points.filter((p) => p[key] !== null);
    if (pts.length === 0) return "";
    return pts
      .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.day).toFixed(1)},${y(p[key]!).toFixed(1)}`)
      .join(" ");
  };

  const target = targetBand ? parseBand(targetBand) : null;

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Band score trend"
      >
        {/* horizontal grid lines at whole bands */}
        {[4, 5, 6, 7, 8, 9].map((b) => (
          <g key={b}>
            <line
              x1={PAD.l}
              y1={y(b)}
              x2={W - PAD.r}
              y2={y(b)}
              stroke="#ECECEF"
              strokeWidth={1}
            />
            <text
              x={PAD.l - 6}
              y={y(b) + 3}
              textAnchor="end"
              fontSize={9}
              fill="#999"
            >
              {b}
            </text>
          </g>
        ))}
        {/* target band line */}
        {target !== null && (
          <g>
            <line
              x1={PAD.l}
              y1={y(target)}
              x2={W - PAD.r}
              y2={y(target)}
              stroke="#be123c"
              strokeWidth={1}
              strokeDasharray="4 4"
              opacity={0.5}
            />
            <text
              x={W - PAD.r}
              y={y(target) - 4}
              textAnchor="end"
              fontSize={9}
              fill="#be123c"
              opacity={0.8}
            >
              Target {target}
            </text>
          </g>
        )}
        {/* series */}
        {series.map((s) => (
          <g key={s.key}>
            <path
              d={path(s.key)}
              fill="none"
              stroke={s.color}
              strokeWidth={1.8}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {points
              .filter((p) => p[s.key] !== null)
              .map((p) => (
                <circle
                  key={p.day}
                  cx={x(p.day)}
                  cy={y(p[s.key]!)}
                  r={2.6}
                  fill={s.color}
                />
              ))}
          </g>
        ))}
        {/* x labels: days 1, 10, 20, 30 */}
        {[1, 10, 20, 30].map((d) => (
          <text
            key={d}
            x={x(d)}
            y={H - 4}
            textAnchor="middle"
            fontSize={9}
            fill="#999"
          >
            D{d}
          </text>
        ))}
      </svg>
      <div className="mt-2 flex flex-wrap items-center gap-4">
        {series.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5 text-[11.5px] text-muted">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            {s.label}
          </span>
        ))}
        <span className="text-[10.5px] text-muted/70">
          L/R bands are approximate (from raw /40 scores)
        </span>
      </div>
    </div>
  );
}
