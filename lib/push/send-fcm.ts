import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getMessaging } from "firebase-admin/messaging"

import type { PushPayload, PushSubscriptionRow } from "./types"

function getFirebaseApp() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (!raw) return null

  if (getApps().length === 0) {
    initializeApp({
      credential: cert(JSON.parse(raw) as Record<string, string>),
    })
  }

  return getMessaging()
}

export function isFcmConfigured(): boolean {
  return Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
}

export async function sendFcmPush(
  rows: PushSubscriptionRow[],
  payload: PushPayload,
): Promise<number> {
  const messaging = getFirebaseApp()
  if (!messaging) return 0

  let sent = 0

  await Promise.allSettled(
    rows.map(async (row) => {
      const subscription = row.subscription
      if (
        typeof subscription !== "object" ||
        subscription === null ||
        (subscription as { type?: string }).type !== "native" ||
        (subscription as { platform?: string }).platform !== "android"
      ) {
        return
      }

      const token = (subscription as { token?: string }).token
      if (!token) return

      await messaging.send({
        token,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: {
          url: payload.url,
          tag: payload.tag,
          title: payload.title,
          body: payload.body,
        },
        android: {
          priority: "high",
        },
      })

      sent += 1
    }),
  )

  return sent
}
