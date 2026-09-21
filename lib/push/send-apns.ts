import { ApnsClient, Notification } from "apns2"

import type { PushPayload, PushSubscriptionRow } from "./types"

let apnsClient: ApnsClient | null = null

function getApnsClient(): ApnsClient | null {
  const team = process.env.APNS_TEAM_ID
  const keyId = process.env.APNS_KEY_ID
  const signingKey = process.env.APNS_KEY
  const topic = process.env.APNS_BUNDLE_ID ?? "com.awrightworld.awn"

  if (!team || !keyId || !signingKey) {
    return null
  }

  if (!apnsClient) {
    apnsClient = new ApnsClient({
      team,
      keyId,
      signingKey: signingKey.replace(/\\n/g, "\n"),
      defaultTopic: topic,
    })
  }

  return apnsClient
}

export function isApnsConfigured(): boolean {
  return getApnsClient() !== null
}

export async function sendApnsPush(
  rows: PushSubscriptionRow[],
  payload: PushPayload,
): Promise<number> {
  const client = getApnsClient()
  if (!client) return 0

  let sent = 0

  await Promise.allSettled(
    rows.map(async (row) => {
      const subscription = row.subscription
      if (
        typeof subscription !== "object" ||
        subscription === null ||
        (subscription as { type?: string }).type !== "native" ||
        (subscription as { platform?: string }).platform !== "ios"
      ) {
        return
      }

      const token = (subscription as { token?: string }).token
      if (!token) return

      const notification = new Notification(token, {
        alert: {
          title: payload.title,
          body: payload.body,
        },
        sound: "default",
        badge: 1,
        data: {
          url: payload.url,
          tag: payload.tag,
        },
      })

      await client.send(notification)
      sent += 1
    }),
  )

  return sent
}
