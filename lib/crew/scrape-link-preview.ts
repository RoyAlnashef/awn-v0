import { getCrewProfilePath } from "@/lib/account/handle"
import { getPublicSiteOrigin } from "@/lib/site-origin"

function getFacebookAccessToken(): string | null {
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN?.trim()
  if (accessToken) {
    return accessToken
  }

  const appId = process.env.FACEBOOK_APP_ID?.trim()
  const appSecret = process.env.FACEBOOK_APP_SECRET?.trim()
  if (appId && appSecret) {
    return `${appId}|${appSecret}`
  }

  return null
}

export async function scrapeCrewProfileLinkPreview(
  handle: string,
): Promise<void> {
  const trimmedHandle = handle.trim()
  if (!trimmedHandle) {
    return
  }

  const accessToken = getFacebookAccessToken()
  if (!accessToken) {
    return
  }

  const profileUrl = `${getPublicSiteOrigin()}${getCrewProfilePath(trimmedHandle)}`
  const params = new URLSearchParams({
    id: profileUrl,
    scrape: "true",
    access_token: accessToken,
  })

  try {
    await fetch(`https://graph.facebook.com/?${params.toString()}`, {
      method: "POST",
    })
  } catch {
    // Best-effort refresh for external link preview caches.
  }
}
