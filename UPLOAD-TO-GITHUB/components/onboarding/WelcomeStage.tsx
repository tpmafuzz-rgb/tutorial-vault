"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, Check } from "lucide-react";
import { WELCOME_SLIDES } from "./steps";

/**
 * Steps 1-3 (welcome) + Step 5 (success), shown as a centered premium modal
 * with fade/slide transitions and progress dots. Skip is always visible.
 */
export function WelcomeStage({
  index, // 0..WELCOME_SLIDES.length-1 for welcome; -1 means "success" screen
  mode,
  total,
  onNext,
  onBack,
  onSkip,
  onStartTour,
  onFinish,
}: {
  index: number;
  mode: "welcome" | "success";
  total: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onStartTour: () => void;
  onFinish: () => void;
}) {
  const isWelcome = mode === "welcome";
  const slide = isWelcome ? WELCOME_SLIDES[index] : null;
  const isLastWelcome = index === WELCOME_SLIDES.length - 1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-ink/55 backdrop-blur-[3px]"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-line bg-canvas shadow-pop"
      >
        {/* Skip (always visible) */}
        <button
          onClick={onSkip}
          className="absolute right-4 top-4 z-10 rounded-lg px-2.5 py-1 text-[12.5px] font-medium text-muted transition-colors hover:bg-surface hover:text-ink"
        >
          Skip
        </button>

        <div className="px-7 pb-6 pt-9">
          <AnimatePresence mode="wait">
            {isWelcome && slide ? (
              <motion.div
                key={`w-${index}`}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="ws-accent-bg mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-ink text-white">
                  <slide.icon size={26} strokeWidth={2} />
                </div>
                <p className="ws-accent-text text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {slide.kicker}
                </p>
                <h2 className="mt-1.5 text-[22px] font-semibold leading-tight tracking-tighter text-ink">
                  {slide.title}
                </h2>
                <p className="mt-2.5 text-[14px] leading-relaxed text-muted">
                  {slide.body}
                </p>
                {slide.bullets && (
                  <ul className="mt-4 space-y-2">
                    {slide.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-2.5 text-[13.5px] text-ink/90"
                      >
                        <span className="ws-accent-bg mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-ink text-white">
                          <Check size={10} strokeWidth={3} />
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 14 }}
                  className="ws-accent-bg mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-ink text-white"
                >
                  <Check size={30} strokeWidth={2.5} />
                </motion.div>
                <h2 className="text-[22px] font-semibold tracking-tighter text-ink">
                  You're all set!
                </h2>
                <p className="mx-auto mt-2 max-w-xs text-[14px] leading-relaxed text-muted">
                  Your vault is ready. Create your first one and start building
                  your personal knowledge library.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer: progress dots + controls */}
        <div className="flex items-center justify-between border-t border-line bg-surface/40 px-7 py-4">
          {/* progress dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: total }).map((_, i) => {
              const current = isWelcome ? index : total - 1;
              return (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === current
                      ? "ws-accent-bg w-5 bg-ink"
                      : "w-1.5 bg-line"
                  }`}
                />
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {isWelcome && index > 0 && (
              <button
                onClick={onBack}
                className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-[13px] font-medium text-muted transition-colors hover:bg-surface hover:text-ink"
              >
                <ChevronLeft size={15} />
                Back
              </button>
            )}

            {isWelcome ? (
              isLastWelcome ? (
                <button
                  onClick={onStartTour}
                  className="ws-accent-bg inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-1.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
                >
                  Take the tour
                  <ArrowRight size={15} />
                </button>
              ) : (
                <button
                  onClick={onNext}
                  className="ws-accent-bg inline-flex items-center gap-1 rounded-lg bg-ink px-4 py-1.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
                >
                  Next
                  <ChevronRight size={15} />
                </button>
              )
            ) : (
              <button
                onClick={onFinish}
                className="ws-accent-bg inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-1.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
              >
                Start using TUTORIAL
                <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
