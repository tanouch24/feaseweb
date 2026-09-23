import "server-only";

import { supabaseUrl } from "@/lib/supabase/config";

export const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

export function isSupabaseServerConfigured() {
  return Boolean(supabaseUrl && supabaseSecretKey);
}
