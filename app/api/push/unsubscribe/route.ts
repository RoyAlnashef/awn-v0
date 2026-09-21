import { NextResponse } from "next/server"

import { requireApiUser } from "@/lib/push/require-api-user"
import { createAdminClient } from "@/lib/supabase/admin"

type UnsubscribeBody = {
  endpoint?: string
}

export async function POST(request: Request) {
  const authResult = await requireApiUser(request)
  if (authResult instanceof NextResponse) return authResult

  let body: UnsubscribeBody
  try {
    body = (await request.json()) as UnsubscribeBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const endpoint = body.endpoint?.trim()
  if (!endpoint) {
    return NextResponse.json({ error: "Missing endpoint" }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from("push_subscriptions")
    .delete()
    .eq("user_id", authResult.user.id)
    .eq("endpoint", endpoint)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
