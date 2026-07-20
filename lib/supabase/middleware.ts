import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import { safeRedirectPath } from "@/lib/auth/safe-redirect"

const PUBLIC_PREFIXES = ["/login", "/auth/callback"]

function isPublicPath(pathname: string) {
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value)
          )
        },
      },
    }
  )

  // Refresh the auth token. Do not add logic between createServerClient and
  // getClaims() — it can cause intermittent logouts.
  await supabase.auth.getClaims()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const hasSession = Boolean(user)

  const { pathname, search } = request.nextUrl

  if (!hasSession && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    const nextPath = `${pathname}${search}`
    if (nextPath !== "/") {
      url.searchParams.set("next", nextPath)
    } else {
      url.search = ""
    }
    return NextResponse.redirect(url)
  }

  if (hasSession && pathname === "/login") {
    const url = request.nextUrl.clone()
    const next = safeRedirectPath(request.nextUrl.searchParams.get("next"))
    url.pathname = next
    url.search = ""
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
