import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import { safeRedirectPath } from "@/lib/auth/safe-redirect"

const PUBLIC_PREFIXES = ["/login", "/auth/callback", "/apply", "/request-access"]
const PUBLIC_PATHS = ["/login/forgot-password", "/login/reset-password"]

const PENDING_GATE_EXEMPT_PREFIXES = [
  "/pending",
  "/apply",
  "/request-access",
  "/auth/callback",
  "/api",
]

function isPublicPath(pathname: string) {
  if (pathname === "/") {
    return true
  }

  if (PUBLIC_PATHS.includes(pathname)) {
    return true
  }

  return PUBLIC_PREFIXES.some((prefix) => {
    if (prefix === "/login") {
      return pathname === "/login"
    }
    return pathname === prefix || pathname.startsWith(`${prefix}/`)
  })
}

function isPendingGateExempt(pathname: string) {
  return PENDING_GATE_EXEMPT_PREFIXES.some(
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
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          )
        },
      },
    },
  )

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

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_approved")
      .eq("id", user!.id)
      .maybeSingle()

    if (profile && profile.is_approved === false) {
      url.pathname = "/pending"
      url.search = ""
      return NextResponse.redirect(url)
    }

    const next = safeRedirectPath(request.nextUrl.searchParams.get("next"))
    url.pathname = next
    url.search = ""
    return NextResponse.redirect(url)
  }

  if (
    hasSession &&
    user &&
    !isPublicPath(pathname) &&
    !isPendingGateExempt(pathname)
  ) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_approved")
      .eq("id", user.id)
      .maybeSingle()

    if (profile && profile.is_approved === false) {
      const url = request.nextUrl.clone()
      url.pathname = "/pending"
      url.search = ""
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
