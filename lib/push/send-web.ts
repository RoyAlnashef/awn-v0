import webpush from "web-push"

import type {
  PushDispatchFailure,
  PushPayload,
  PushSubscriptionRow,
} from "./types"

function getVapidConfig() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY

  if (!publicKey || !privateKey) {
    return null
  }

  return {
    publicKey,
    privateKey,
    email:
      process.env.VAPID_EMAIL ??
      process.env.EMAIL_FROM?.match(/<([^>]+)>/)?.[1] ??
      "push@awrightnetwork.com",
  }
}

function endpointPrefix(endpoint: string): string {
  return endpoint.length > 48 ? `${endpoint.slice(0, 48)}…` : endpoint
}

export function isWebPushConfigured(): boolean {
  return getVapidConfig() !== null
}

export async function sendWebPush(
  rows: PushSubscriptionRow[],
  payload: PushPayload,
): Promise<{
  sent: number
  expiredEndpoints: string[]
  failures: PushDispatchFailure[]
}> {
  const vapid = getVapidConfig()
  if (!vapid) {
    return { sent: 0, expiredEndpoints: [], failures: [] }
  }

  webpush.setVapidDetails(
    `mailto:${vapid.email}`,
    vapid.publicKey,
    vapid.privateKey,
  )

  const body = JSON.stringify(payload)
  const expiredEndpoints: string[] = []
  const failures: PushDispatchFailure[] = []
  let sent = 0

  await Promise.all(
    rows.map(async (row) => {
      const subscription = row.subscription
      if (
        typeof subscription !== "object" ||
        subscription === null ||
        (subscription as { type?: string }).type !== "web"
      ) {
        return
      }

      const keys = (subscription as { keys?: { p256dh?: string; auth?: string } })
        .keys

      if (!keys?.p256dh || !keys.auth) {
        failures.push({
          channel: "web",
          endpointPrefix: endpointPrefix(row.endpoint),
          message: "Missing web push keys on subscription row",
        })
        return
      }

      try {
        await webpush.sendNotification(
          {
            endpoint: row.endpoint,
            keys: {
              p256dh: keys.p256dh,
              auth: keys.auth,
            },
          },
          body,
        )
        sent += 1
      } catch (error) {
        const statusCode =
          typeof error === "object" &&
          error !== null &&
          "statusCode" in error &&
          typeof (error as { statusCode: unknown }).statusCode === "number"
            ? (error as { statusCode: number }).statusCode
            : null

        if (statusCode === 410 || statusCode === 404) {
          expiredEndpoints.push(row.endpoint)
        }

        const message =
          typeof error === "object" &&
          error !== null &&
          "body" in error &&
          typeof (error as { body: unknown }).body === "string"
            ? (error as { body: string }).body
            : error instanceof Error
              ? error.message
              : "Web push send failed"

        failures.push({
          channel: "web",
          endpointPrefix: endpointPrefix(row.endpoint),
          message: statusCode ? `${statusCode}: ${message}` : message,
        })
      }
    }),
  )

  return { sent, expiredEndpoints, failures }
}
