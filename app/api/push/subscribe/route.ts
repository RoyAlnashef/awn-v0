import { NextResponse } from "next/server"

import { requireApiUser } from "@/lib/push/require-api-user"
import { createAdminClient } from "@/lib/supabase/admin"

type SubscribeBody = {
  subscription?: {
    endpoint?: string
    keys?: {
      p256dh?: string
      auth?: string
    }
    expirationTime?: number | null
  }
}

export async function POST(request: Request) {
  const authResult = await requireApiUser(request)
  if (authResult instanceof NextResponse) return authResult

  let body: SubscribeBody
  try {
    body = (await request.json()) as SubscribeBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const endpoint = body.subscription?.endpoint?.trim()
  const p256dh = body.subscription?.keys?.p256dh
  const auth = body.subscription?.keys?.auth

  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json(
      { error: "Invalid push subscription" },
      { status: 400 },
    )
  }

  const admin = createAdminClient()
  const { error } = await admin.from("push_subscriptions").upsert(
    {
      user_id: authResult.user.id,
      endpoint,
      subscription: {
        type: "web",
        endpoint,
        keys: { p256dh, auth },
        expirationTime: body.subscription?.expirationTime ?? null,
      },
      updated_at: new Date().toISOString(),
    },
    { onConflict: "endpoint" },
  )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
