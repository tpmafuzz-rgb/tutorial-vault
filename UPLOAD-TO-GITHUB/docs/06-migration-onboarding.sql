-- ============================================================================
-- MIGRATION: Onboarding status
-- Paste into Supabase SQL Editor and Run. Safe to run more than once.
-- Adds a single `onboarded` flag to profiles so the first-time onboarding
-- shows once per account and follows the user across devices.
-- ============================================================================

alter table profiles
  add column if not exists onboarded boolean not null default false;

-- ============================================================================
-- Done. Existing users keep onboarded = false, so they'll see the tour once.
-- (Set it true manually for yourself if you want to skip:
--    update profiles set onboarded = true where id = auth.uid();  )
-- ============================================================================
