export function getTimeOfDayGreeting(date = new Date()): string {
  const hour = date.getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export function firstNameFromFullName(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return "Member"
  return trimmed.split(/\s+/)[0] ?? "Member"
}

export function formatNowGreeting(firstName: string, date = new Date()): string {
  return `${getTimeOfDayGreeting(date)}, ${firstName}`
}
