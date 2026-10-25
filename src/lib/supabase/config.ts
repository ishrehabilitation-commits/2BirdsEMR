export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
// Accept either the new publishable key or the legacy anon key.
export const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Without keys the app runs in demo mode on built-in fake data. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
