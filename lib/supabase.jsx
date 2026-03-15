import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Server-side only: returns a Supabase client that sets the RLS user context.
 * Uses the service role key to bypass JWT auth while still respecting
 * app.user_email RLS policies.
 * Requires SUPABASE_SERVICE_ROLE_KEY in environment variables.
 */
export const getSupabaseWithUser = (userEmail) => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  const client = createClient(supabaseUrl, serviceRoleKey);
  // Set session-local config so RLS policies can read it
  client.rpc("set_config", {
    setting: "app.user_email",
    value: userEmail,
    is_local: true,
  });
  return client;
};