import type { SupabaseClient } from "@supabase/supabase-js"

export const HANDLE_MIN_LENGTH = 3
export const HANDLE_MAX_LENGTH = 40
export const HANDLE_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function slugifyHandle(name: string): string {
  let slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")

  if (slug.length < HANDLE_MIN_LENGTH) {
    slug = "member"
  }

  if (slug.length > HANDLE_MAX_LENGTH) {
    slug = slug.slice(0, HANDLE_MAX_LENGTH).replace(/-$/, "")
  }

  return slug
}

export function isValidHandle(handle: string): boolean {
  return (
    HANDLE_REGEX.test(handle) &&
    handle.length >= HANDLE_MIN_LENGTH &&
    handle.length <= HANDLE_MAX_LENGTH
  )
}

export function getCrewProfilePath(handle: string): string {
  return `/crew/${encodeURIComponent(handle)}`
}

export async function generateUniqueHandle(
  supabase: SupabaseClient,
  baseName: string,
  excludeProfileId?: string,
): Promise<string> {
  const base = slugifyHandle(baseName)
  let candidate = base
  let suffix = 2

  while (true) {
    let query = supabase
      .from("profiles")
      .select("id")
      .ilike("handle", candidate)
      .limit(1)

    if (excludeProfileId) {
      query = query.neq("id", excludeProfileId)
    }

    const { data } = await query.maybeSingle()

    if (!data) {
      return candidate
    }

    candidate = `${base}-${suffix}`
    suffix += 1
  }
}

export async function ensureProfileHandle(
  supabase: SupabaseClient,
  profileId: string,
  name: string,
  email: string,
): Promise<string> {
  const { data: existing } = await supabase
    .from("profiles")
    .select("handle")
    .eq("id", profileId)
    .maybeSingle()

  const current = existing?.handle?.trim()
  if (current) {
    return current
  }

  const source = name.trim() || email.split("@")[0] || "member"
  const handle = await generateUniqueHandle(supabase, source, profileId)

  const { error } = await supabase
    .from("profiles")
    .update({ handle })
    .eq("id", profileId)

  if (error) {
    throw new Error(error.message)
  }

  return handle
}
