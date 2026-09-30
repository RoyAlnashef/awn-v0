export const TIMEZONE_COOKIE_NAME = "awn-timezone"

export function isValidTimeZone(timeZone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone })
    return true
  } catch {
    return false
  }
}

export function getHourInTimeZone(date: Date, timeZone: string): number {
  const part = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    hour12: false,
  })
    .formatToParts(date)
    .find((p) => p.type === "hour")

  const hour = Number(part?.value ?? 0)
  return hour === 24 ? 0 : hour
}

export function getTimeOfDayGreeting(date = new Date(), timeZone?: string): string {
  const hour =
    timeZone && isValidTimeZone(timeZone)
      ? getHourInTimeZone(date, timeZone)
      : date.getHours()

  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export function firstNameFromFullName(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return "Member"
  return trimmed.split(/\s+/)[0] ?? "Member"
}

export function formatNeutralGreeting(firstName: string): string {
  return `Hello, ${firstName}!`
}

export function formatNowGreeting(
  firstName: string,
  date = new Date(),
  timeZone?: string,
): string {
  return `${getTimeOfDayGreeting(date, timeZone)}, ${firstName}!`
}

/** SSR title when no timezone cookie yet; avoids UTC-based “Good evening” at local noon. */
export function resolveServerNowGreeting(
  firstName: string,
  timeZoneFromCookie: string | undefined,
  date = new Date(),
): string {
  if (timeZoneFromCookie && isValidTimeZone(timeZoneFromCookie)) {
    return formatNowGreeting(firstName, date, timeZoneFromCookie)
  }
  return formatNeutralGreeting(firstName)
}

export function setUserTimezoneCookie(): void {
  if (typeof document === "undefined") return

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  if (!isValidTimeZone(timeZone)) return

  document.cookie = `${TIMEZONE_COOKIE_NAME}=${encodeURIComponent(timeZone)}; path=/; max-age=31536000; SameSite=Lax`
}
