"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { TourStop } from "./steps";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PAD = 8; // spotlight padding around the target

/**
 * Interactive product tour: dims the screen, cuts a spotlight around the real
 * target element, and shows a tooltip that points at it. Next / Back / Skip.
 */
export function SpotlightTour({
  stops,
  index,
  onNext,
  onBack,
  onSkip,
  onFinish,
  total,
  stepOffset = 0,
}: {
  stops: TourStop[];
  index: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onFinish: () => void;
  /** total steps across the whole onboarding (for the progress counter) */
  total: number;
  /** how many steps came before the tour (welcome slides) */
  stepOffset?: number;
}) {
  const stop = stops[index];
  const [rect, setRect] = React.useState<Rect | null>(null);
  const [missing, setMissing] = React.useState(false);

  // Measure the target element, retrying briefly in case it's still mounting.
  React.useEffect(() => {
    let raf = 0;
    let tries = 0;
    const measure = () => {
      const el = document.querySelector(stop.selector) as HTMLElement | null;
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
        setMissing(false);
        el.scrollIntoView({ block: "nearest", behavior: "smooth" });
      } else if (tries < 20) {
        tries++;
        raf = requestAnimationFrame(measure);
      } else {
        setMissing(true);
      }
    };
    measure();

    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [stop.selector]);

  const isLast = index === stops.length - 1;
  const Icon = stop.icon;

  // Tooltip position: place near the target, clamped to the viewport.
  const tooltip = useTooltipPosition(rect, stop.placement);

  return (
    <div
      className="fixed inset-0 z-[100]"
      role="dialog"
      aria-modal="true"
      aria-label="Product tour"
    >
      {/* Dim overlay with a spotlight cut-out (box-shadow trick) */}
      <AnimatePresence>
        {rect && !missing && (
          <motion.div
            key="spot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-none absolute rounded-xl"
            style={{
              top: rect.top - PAD,
              left: rect.left - PAD,
              width: rect.width + PAD * 2,
              height: rect.height + PAD * 2,
              boxShadow: "0 0 0 9999px rgba(17,17,17,0.55)",
              outline: "2px solid rgba(255,255,255,0.9)",
              outlineOffset: "2px",
            }}
          />
        )}
        {(!rect || missing) && (
          // fallback: plain dim if the element can't be found
          <motion.div
            key="dim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink/55"
          />
        )}
      </AnimatePresence>

      {/* click-catcher to allow skip by clicking outside the tooltip */}
      <div className="absolute inset-0" onClick={onSkip} />

      {/* Tooltip card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="absolute w-[300px] max-w-[calc(100vw-2rem)] rounded-2xl border border-line bg-canvas p-4 shadow-pop"
          style={tooltip}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="ws-accent-bg grid h-8 w-8 place-items-center rounded-lg bg-ink text-white">
              <Icon size={15} />
            </span>
            <button
              onClick={onSkip}
              className="grid h-7 w-7 place-items-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-ink"
              aria-label="Skip tour"
            >
              <X size={15} />
            </button>
          </div>

          <h3 className="text-[14.5px] font-semibold tracking-tight text-ink">
            {stop.title}
          </h3>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">
            {missing
              ? "This feature appears here once you're in the app."
              : stop.body}
          </p>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-[11.5px] font-medium text-muted tabular-nums">
              {stepOffset + index + 1} / {total}
            </span>
            <div className="flex items-center gap-1.5">
              {index > 0 && (
                <button
                  onClick={onBack}
                  className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-[12.5px] font-medium text-muted transition-colors hover:bg-surface hover:text-ink"
                >
                  <ChevronLeft size={14} />
                  Back
                </button>
              )}
              <button
                onClick={isLast ? onFinish : onNext}
                className="ws-accent-bg inline-flex items-center gap-1 rounded-lg bg-ink px-3 py-1.5 text-[12.5px] font-medium text-white transition-opacity hover:opacity-90"
              >
                {isLast ? "Finish" : "Next"}
                {!isLast && <ChevronRight size={14} />}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* persistent skip in the corner */}
      <button
        onClick={onSkip}
        className="absolute right-4 top-4 rounded-lg bg-canvas/90 px-3 py-1.5 text-[12.5px] font-medium text-muted shadow-subtle backdrop-blur transition-colors hover:text-ink"
      >
        Skip tour
      </button>
    </div>
  );
}

/** Compute a clamped tooltip position from the target rect + placement. */
function useTooltipPosition(
  rect: Rect | null,
  placement: TourStop["placement"] = "bottom"
): React.CSSProperties {
  const [vw, setVw] = React.useState(1024);
  const [vh, setVh] = React.useState(768);
  React.useEffect(() => {
    const set = () => {
      setVw(window.innerWidth);
      setVh(window.innerHeight);
    };
    set();
    window.addEventListener("resize", set);
    return () => window.removeEventListener("resize", set);
  }, []);

  const W = Math.min(300, vw - 32);
  const H = 190; // approx tooltip height for clamping
  const gap = 14;

  if (!rect) {
    // center it (fallback / mobile)
    return {
      top: Math.max(16, vh / 2 - H / 2),
      left: Math.max(16, vw / 2 - W / 2),
    };
  }

  let top: number;
  let left: number;

  // on small screens, always place below-center for reliability
  if (vw < 640) {
    top = Math.min(rect.top + rect.height + gap, vh - H - 16);
    left = Math.max(16, Math.min(rect.left, vw - W - 16));
    return { top: Math.max(16, top), left };
  }

  switch (placement) {
    case "right":
      top = rect.top;
      left = rect.left + rect.width + gap;
      break;
    case "left":
      top = rect.top;
      left = rect.left - W - gap;
      break;
    case "top":
      top = rect.top - H - gap;
      left = rect.left;
      break;
    default: // bottom
      top = rect.top + rect.height + gap;
      left = rect.left;
  }

  // clamp to viewport
  top = Math.max(16, Math.min(top, vh - H - 16));
  left = Math.max(16, Math.min(left, vw - W - 16));
  return { top, left };
}
