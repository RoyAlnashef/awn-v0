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

const SANDBOX_HOST = "api.sandbox.push.apple.com"
const PRODUCTION_HOST = "api.push.apple.com"

const clients = new Map<string, ApnsClient>()

export function isApnsSandboxMode(): boolean {
  const raw = process.env.APNS_USE_SANDBOX?.trim().toLowerCase()
  return raw === "true" || raw === "1" || raw === "yes"
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

function getApnsClientForHost(host: string): ApnsClient | null {
  const existing = clients.get(host)
  if (existing) return existing

  const client = createApnsClient(host)
  if (client) {
    clients.set(host, client)
  }
  return client
}

function primaryApnsHost(): string {
  return isApnsSandboxMode() ? SANDBOX_HOST : PRODUCTION_HOST
}

function alternateApnsHost(host: string): string {
  return host === SANDBOX_HOST ? PRODUCTION_HOST : SANDBOX_HOST
}

function extractApnsFailureReason(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "reason" in error &&
    typeof (error as { reason: unknown }).reason === "string"
  ) {
    return (error as { reason: string }).reason
  }
  if (error instanceof Error) {
    return error.message
  }
  return "APNs send failed"
}

function shouldRetryAlternateApnsEnvironment(reason: string): boolean {
  return (
    reason === "BadEnvironmentKeyInToken" ||
    reason === "BadDeviceToken"
  )
}

export function isApnsConfigured(): boolean {
  return getApnsClientForHost(primaryApnsHost()) !== null
}

async function sendOneApns(
  client: ApnsClient,
  token: string,
  payload: PushPayload,
): Promise<void> {
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
}

export async function sendApnsPush(
  rows: PushSubscriptionRow[],
  payload: PushPayload,
): Promise<ApnsSendResult> {
  const primaryHost = primaryApnsHost()
  const primaryClient = getApnsClientForHost(primaryHost)
  if (!primaryClient) {
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

      try {
        await sendOneApns(primaryClient, token, payload)
        sent += 1
      } catch (error) {
        const reason = extractApnsFailureReason(error)

        if (shouldRetryAlternateApnsEnvironment(reason)) {
          const alternateHost = alternateApnsHost(primaryHost)
          const alternateClient = getApnsClientForHost(alternateHost)
          if (alternateClient) {
            try {
              await sendOneApns(alternateClient, token, payload)
              sent += 1
              return
            } catch (retryError) {
              failures.push({
                channel: "apns",
                endpointPrefix: endpointPrefix(token),
                message: `${extractApnsFailureReason(retryError)} (retried ${alternateHost})`,
              })
              return
            }
          }
        }

        failures.push({
          channel: "apns",
          endpointPrefix: endpointPrefix(token),
          message: `${reason} (${primaryHost})`,
        })
      }
    }),
  )

  return { sent, failures }
}
