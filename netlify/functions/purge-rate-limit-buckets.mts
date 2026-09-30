export default async function purgeRateLimitBuckets() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("rate_limit_cleanup_not_configured");
    return;
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/purge_expired_rate_limit_buckets`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_batch_size: 1000 }),
  });

  if (!response.ok) {
    console.error("rate_limit_cleanup_failed", response.status);
  }
}

export const config = {
  schedule: "@hourly",
};
