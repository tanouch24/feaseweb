import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "@/lib/supabase/config";
import { isSupabaseServerConfigured, supabaseSecretKey } from "@/lib/supabase/server-config";

export function createAdminClient() {
  if (!isSupabaseServerConfigured()) return null;
  return createClient(supabaseUrl!, supabaseSecretKey!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
