"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client (singleton). Uses the publishable/anon key — all
 * access is governed by Postgres Row-Level Security, so this key is safe to
 * ship to the browser.
 */
let client: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  if (client) return client;
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return client;
}
