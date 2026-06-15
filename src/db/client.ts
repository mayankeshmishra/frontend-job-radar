import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Env } from "../config/env";

let supabaseClient: SupabaseClient | null = null;

/**
 * Returns a shared Supabase client instance.
 */
export function getClient(env: Env): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  }
  return supabaseClient;
}
