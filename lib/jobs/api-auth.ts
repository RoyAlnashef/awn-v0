import { createClient } from "@/lib/supabase/server"

export async function requireApiUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return { supabase, user: null as null, error: "Unauthorized" as const }
  }

  return { supabase, user, error: null as null }
}

export function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status })
}
