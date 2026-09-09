import { createClient } from "@/lib/supabase/server"

export async function POST() {
  const supabase = await createClient()
  const { error } = await supabase.rpc("clear_last_active")

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return new Response(null, { status: 204 })
}
