import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import { safeRedirectPath } from "@/lib/auth/safe-redirect"
import { suspendedLoginSearchParams } from "@/lib/auth/suspended-message"

const PUBLIC_PREFIXES = [
  "/login",
  "/auth/callback",
  "/crew",
  "/api/crew",
  "/apply",
  "/request-access",
  "/privacy",
  "/terms",
  "/community-guidelines",
  "/job-posting-policy",
  "/faqs",
]
const PUBLIC_PATHS = [
  "/login/forgot-password",
  "/login/reset-password",
]

const PENDING_GATE_EXEMPT_PREFIXES = [
  "/pending",
  "/apply",
  "/request-access",
  "/auth/callback",
  "/api",
]

type ProfileGate = {
  is_approved: boolean
  status: string
}

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

/** Suspended users must not use the app or authenticated APIs; /login needs special handling. */
function shouldEnforceSuspendedGate(pathname: string) {
  if (pathname === "/login") {
    return true
  }
  return !isPublicPath(pathname)
}

async function fetchProfileGate(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
): Promise<ProfileGate | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_approved, status")
    .eq("id", userId)
    .maybeSingle()

  return profile ?? null
}

function redirectWithSessionCookies(
  url: URL,
  supabaseResponse: NextResponse,
) {
  const redirect = NextResponse.redirect(url)
  for (const { name, value, ...options } of supabaseResponse.cookies.getAll()) {
    redirect.cookies.set(name, value, options)
  }
  return redirect
}

async function rejectSuspendedSession(
  request: NextRequest,
  supabase: ReturnType<typeof createServerClient>,
  supabaseResponse: NextResponse,
) {
  await supabase.auth.signOut()

  const url = request.nextUrl.clone()
  url.pathname = "/login"
  url.search = suspendedLoginSearchParams()

  return redirectWithSessionCookies(url, supabaseResponse)
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

  let profileGate: ProfileGate | null = null

  if (hasSession && user) {
    const needsProfile =
      shouldEnforceSuspendedGate(pathname) ||
      (pathname === "/login") ||
      (!isPublicPath(pathname) && !isPendingGateExempt(pathname))

    if (needsProfile) {
      profileGate = await fetchProfileGate(supabase, user.id)
    }

    if (
      profileGate?.status === "suspended" &&
      shouldEnforceSuspendedGate(pathname)
    ) {
      return rejectSuspendedSession(request, supabase, supabaseResponse)
    }
  }

  if (hasSession && pathname === "/login") {
    const url = request.nextUrl.clone()

    const profile =
      profileGate ?? (user ? await fetchProfileGate(supabase, user.id) : null)

    if (profile?.status === "suspended") {
      return rejectSuspendedSession(request, supabase, supabaseResponse)
    }

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
    const profile =
      profileGate ?? (await fetchProfileGate(supabase, user.id))

    if (profile?.status === "suspended") {
      return rejectSuspendedSession(request, supabase, supabaseResponse)
    }

    if (profile && profile.is_approved === false) {
      const url = request.nextUrl.clone()
      url.pathname = "/pending"
      url.search = ""
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
