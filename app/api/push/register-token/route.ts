import { NextResponse } from "next/server"

import { requireApiUser } from "@/lib/push/require-api-user"
import { createAdminClient } from "@/lib/supabase/admin"

type RegisterTokenBody = {
  token?: string
  platform?: "ios" | "android"
}

export async function POST(request: Request) {
  const authResult = await requireApiUser(request)
  if (authResult instanceof NextResponse) return authResult

  let body: RegisterTokenBody
  try {
    body = (await request.json()) as RegisterTokenBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const token = body.token?.trim()
  const platform = body.platform

  if (!token || (platform !== "ios" && platform !== "android")) {
    return NextResponse.json(
      { error: "Missing token or platform" },
      { status: 400 },
    )
  }

  const admin = createAdminClient()
  const { error } = await admin.from("push_subscriptions").upsert(
    {
      user_id: authResult.user.id,
      endpoint: token,
      subscription: { token, platform, type: "native" },
      updated_at: new Date().toISOString(),
    },
    { onConflict: "endpoint" },
  )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
