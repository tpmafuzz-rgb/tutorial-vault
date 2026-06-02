"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { useVault } from "@/lib/store";
import { WELCOME_SLIDES, buildTourStops } from "./steps";
import { WelcomeStage } from "./WelcomeStage";
import { SpotlightTour } from "./SpotlightTour";

type Phase = "welcome" | "tour" | "success";

/**
 * Orchestrates the whole first-time experience:
 *   welcome slides (1..3)  ->  interactive tour (4)  ->  success (5)
 * Auto-starts once for users whose profile.onboarded is false, and never again
 * after completion/skip (persisted to Supabase + localStorage). Replayable via
 * Settings -> restartOnboarding().
 */
export function Onboarding() {
  const pathname = usePathname();
  const loaded = useVault((s) => s.loaded);
  const userId = useVault((s) => s.userId);
  const onboarded = useVault((s) => s.profile.onboarded);
  const workspace = useVault((s) => s.workspace);
  const completeOnboarding = useVault((s) => s.completeOnboarding);

  const [open, setOpen] = React.useState(false);
  const [phase, setPhase] = React.useState<Phase>("welcome");
  const [welcomeIndex, setWelcomeIndex] = React.useState(0);
  const [tourIndex, setTourIndex] = React.useState(0);

  const isAcademic = workspace === "academic";
  const tourStops = React.useMemo(() => buildTourStops(isAcademic), [isAcademic]);

  // total dots = welcome slides + (tour counts as 1 step) + success
  const totalSteps = WELCOME_SLIDES.length + 2;

  // Decide whether to auto-open (first-time users only, and only inside the app)
  React.useEffect(() => {
    if (!loaded || !userId) return;
    // localStorage fast-path prevents any flicker on repeat visits
    let localDone = false;
    try {
      localDone = localStorage.getItem("tv-onboarded") === "1";
    } catch {
      /* ignore */
    }
    if (!onboarded && !localDone) {
      setPhase("welcome");
      setWelcomeIndex(0);
      setTourIndex(0);
      setOpen(true);
    }
  }, [loaded, userId, onboarded]);

  const finish = React.useCallback(() => {
    setOpen(false);
    void completeOnboarding();
  }, [completeOnboarding]);

  if (!open) return null;
  // never cover the auth pages
  if (pathname.startsWith("/login")) return null;

  return (
    <AnimatePresence>
      {phase === "welcome" && (
        <WelcomeStage
          key="welcome"
          mode="welcome"
          index={welcomeIndex}
          total={totalSteps}
          onNext={() => setWelcomeIndex((i) => Math.min(i + 1, WELCOME_SLIDES.length - 1))}
          onBack={() => setWelcomeIndex((i) => Math.max(i - 1, 0))}
          onSkip={finish}
          onStartTour={() => {
            setTourIndex(0);
            setPhase("tour");
          }}
          onFinish={finish}
        />
      )}

      {phase === "tour" && (
        <SpotlightTour
          key="tour"
          stops={tourStops}
          index={tourIndex}
          total={totalSteps}
          stepOffset={WELCOME_SLIDES.length}
          onNext={() => setTourIndex((i) => Math.min(i + 1, tourStops.length - 1))}
          onBack={() => {
            if (tourIndex === 0) {
              setPhase("welcome");
              setWelcomeIndex(WELCOME_SLIDES.length - 1);
            } else {
              setTourIndex((i) => i - 1);
            }
          }}
          onSkip={finish}
          onFinish={() => setPhase("success")}
        />
      )}

      {phase === "success" && (
        <WelcomeStage
          key="success"
          mode="success"
          index={-1}
          total={totalSteps}
          onNext={finish}
          onBack={() => {
            setPhase("tour");
            setTourIndex(tourStops.length - 1);
          }}
          onSkip={finish}
          onStartTour={() => {}}
          onFinish={finish}
        />
      )}
    </AnimatePresence>
  );
}
