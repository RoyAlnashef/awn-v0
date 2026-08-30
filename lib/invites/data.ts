export const MAX_MEMBER_INVITES = 5

export const MEMBER_INVITE_STATUSES = [
  "pending",
  "accepted",
  "rescinded",
  "expired",
] as const

export type MemberInviteStatus = (typeof MEMBER_INVITE_STATUSES)[number]

export type MemberInvite = {
  id: string
  inviteeEmail: string
  status: MemberInviteStatus
  sentAt: string
  rescindedAt: string | null
  acceptedAt: string | null
  applicationId: string | null
}

export type AdminMemberInvite = MemberInvite & {
  inviterId: string
  inviterName: string
  inviterEmail: string
  applicationStatus: MembershipApplicationStatus | null
  applyUrl: string
}

export const MEMBERSHIP_APPLICATION_STATUSES = [
  "pending",
  "approved",
  "denied",
] as const

export type MembershipApplicationStatus =
  (typeof MEMBERSHIP_APPLICATION_STATUSES)[number]

export const MEMBERSHIP_APPLICATION_SOURCES = [
  "invite",
  "request_access",
] as const

export type MembershipApplicationSource =
  (typeof MEMBERSHIP_APPLICATION_SOURCES)[number]

export const REQUEST_ACCESS_INVITER_LABEL = "Sign up form"

export type ApplicationNoteVisibility = "invitee_only" | "both"

export type SocialLinksInput = {
  website?: string
  instagram?: string
  twitter?: string
  linkedin?: string
  youtube?: string
}

export type MembershipApplication = {
  id: string
  inviteId: string | null
  source: MembershipApplicationSource
  inviteeUserId: string | null
  fullName: string
  email: string
  title: string
  resumeUrl: string | null
  socialLinks: SocialLinksInput
  status: MembershipApplicationStatus
  adminNote: string | null
  noteVisibility: ApplicationNoteVisibility | null
  reviewedAt: string | null
  createdAt: string
  inviterId: string
  inviterName: string
  inviterEmail: string
  inviterAvatarUrl: string | null
}

export const inviteStatusConfig: Record<
  MemberInviteStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  },
  accepted: {
    label: "Accepted",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  },
  rescinded: {
    label: "Rescinded",
    className: "bg-muted text-muted-foreground border-border",
  },
  expired: {
    label: "Expired",
    className: "bg-muted text-muted-foreground border-border",
  },
}

export const applicationStatusConfig: Record<
  MembershipApplicationStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  },
  denied: {
    label: "Denied",
    className: "bg-red-500/15 text-red-400 border-red-500/20",
  },
}

export function countActiveInviteSlots(
  invites: Pick<MemberInvite, "status">[],
): number {
  return invites.filter(
    (invite) => invite.status === "pending" || invite.status === "accepted",
  ).length
}

export function getInviteQuota(
  session: { canAccessAdmin: boolean },
  slotsUsed: number,
) {
  if (session.canAccessAdmin) {
    return {
      unlimitedInvites: true as const,
      slotsUsed,
      slotsRemaining: null,
      maxSlots: null,
    }
  }

  return {
    unlimitedInvites: false as const,
    slotsUsed,
    slotsRemaining: Math.max(0, MAX_MEMBER_INVITES - slotsUsed),
    maxSlots: MAX_MEMBER_INVITES,
  }
}
