import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

type ApiUser = {
  id: string
  email?: string
}

export async function requireApiUser(
  request: Request,
): Promise<{ user: ApiUser } | NextResponse> {
  const supabase = await createClient()
  const {
    data: { user: cookieUser },
  } = await supabase.auth.getUser()

  if (cookieUser) {
    return { user: cookieUser }
  }

  const authHeader = request.headers.get("Authorization")
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7)
    const bearerClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        global: {
          headers: { Authorization: `Bearer ${token}` },
        },
      },
    )
    const {
      data: { user: bearerUser },
    } = await bearerClient.auth.getUser()

    if (bearerUser) {
      return { user: bearerUser }
    }
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}
