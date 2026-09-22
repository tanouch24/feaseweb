import "server-only";
import { createClient } from "@supabase/supabase-js";
import { isSupabaseServerConfigured, supabaseSecretKey, supabaseUrl } from "@/lib/supabase/config";

export function createAdminClient() {
  if (!isSupabaseServerConfigured()) return null;
  return createClient(process.env.SUPABASE_URL ?? supabaseUrl!, supabaseSecretKey!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
