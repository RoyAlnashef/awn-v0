import { ApnsClient, Notification } from "apns2"

import type {
  PushDispatchFailure,
  PushPayload,
  PushSubscriptionRow,
} from "./types"

type ApnsSendResult = {
  sent: number
  failures: PushDispatchFailure[]
}

let productionClient: ApnsClient | null = null
let sandboxClient: ApnsClient | null = null

function isApnsSandbox(): boolean {
  return process.env.APNS_USE_SANDBOX === "true"
}

function endpointPrefix(endpoint: string): string {
  return endpoint.length > 24 ? `${endpoint.slice(0, 24)}…` : endpoint
}

function createApnsClient(host: string): ApnsClient | null {
  const team = process.env.APNS_TEAM_ID
  const keyId = process.env.APNS_KEY_ID
  const signingKey = process.env.APNS_KEY
  const topic = process.env.APNS_BUNDLE_ID ?? "com.awrightworld.awn"

  if (!team || !keyId || !signingKey) {
    return null
  }

  return new ApnsClient({
    team,
    keyId,
    signingKey: signingKey.replace(/\\n/g, "\n"),
    defaultTopic: topic,
    host,
  })
}

function getApnsClient(): ApnsClient | null {
  const sandbox = isApnsSandbox()

  if (sandbox) {
    if (!sandboxClient) {
      sandboxClient = createApnsClient("api.sandbox.push.apple.com")
    }
    return sandboxClient
  }

  if (!productionClient) {
    productionClient = createApnsClient("api.push.apple.com")
  }
  return productionClient
}

export function isApnsConfigured(): boolean {
  return getApnsClient() !== null
}

export async function sendApnsPush(
  rows: PushSubscriptionRow[],
  payload: PushPayload,
): Promise<ApnsSendResult> {
  const client = getApnsClient()
  if (!client) {
    return { sent: 0, failures: [] }
  }

  const failures: PushDispatchFailure[] = []
  let sent = 0

  await Promise.all(
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

      try {
        await client.send(notification)
        sent += 1
      } catch (error) {
        const message =
          typeof error === "object" &&
          error !== null &&
          "reason" in error &&
          typeof (error as { reason: unknown }).reason === "string"
            ? (error as { reason: string }).reason
            : error instanceof Error
              ? error.message
              : "APNs send failed"

        failures.push({
          channel: "apns",
          endpointPrefix: endpointPrefix(token),
          message,
        })
      }
    }),
  )

  return { sent, failures }
}
