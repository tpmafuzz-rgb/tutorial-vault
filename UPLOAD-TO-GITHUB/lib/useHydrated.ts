"use client";

import { useEffect } from "react";
import { useVault } from "./store";

/**
 * Triggers the one-time Supabase data load for the signed-in user and returns
 * whether the vault has finished loading. Pages use this to show skeletons
 * until real data is ready (and to avoid SSR/client markup mismatches, since
 * the store starts empty on both server and first client render).
 */
export function useHydrated(): boolean {
  const loaded = useVault((s) => s.loaded);
  const load = useVault((s) => s.load);

  useEffect(() => {
    if (!loaded) void load();
  }, [loaded, load]);

  return loaded;
}
