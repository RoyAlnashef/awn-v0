import type { SupabaseClient } from "@supabase/supabase-js"

export async function expireStaleJobs(
  supabase: SupabaseClient,
): Promise<void> {
  const { error } = await supabase.rpc("expire_stale_job_postings")
  if (error) {
    throw new Error(error.message)
  }
}
