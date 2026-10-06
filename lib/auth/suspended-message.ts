export const SUSPENDED_ACCOUNT_MESSAGE =
  "Your account is under review. Please contact support if you believe this is an error."

export function suspendedLoginSearchParams(): string {
  return `error=${encodeURIComponent(SUSPENDED_ACCOUNT_MESSAGE)}`
}
