import type { Person } from "@/lib/people-data"
import type { JobSharePayload, MemberSharePayload } from "@/lib/messages-data"
import { sharePreviewText as jobSharePreviewText } from "@/lib/messages/job-share"

export type MemberShareRpcRow = {
  shared_profile_id?: string | null
  shared_profile_name?: string | null
  shared_profile_title?: string | null
  shared_profile_avatar_url?: string | null
  member_share_snapshot?: MemberSharePayload | null
}

function snapshotToMemberShare(
  snapshot: MemberSharePayload,
): MemberSharePayload | undefined {
  if (!snapshot.id || !snapshot.name) return undefined
  return {
    id: snapshot.id,
    name: snapshot.name,
    role: snapshot.role || "AWN Member",
    department: snapshot.department,
    homeBase: snapshot.homeBase,
    availability: snapshot.availability,
    avatar: snapshot.avatar,
    credits: snapshot.credits,
    vouches: snapshot.vouches,
    yearsExperience: snapshot.yearsExperience,
  }
}

export function mapRpcMemberShare(
  row: MemberShareRpcRow,
): MemberSharePayload | undefined {
  if (row.member_share_snapshot) {
    const fromSnapshot = snapshotToMemberShare(row.member_share_snapshot)
    if (fromSnapshot) return fromSnapshot
  }

  if (!row.shared_profile_id || !row.shared_profile_name) return undefined

  return {
    id: row.shared_profile_id,
    name: row.shared_profile_name,
    role: row.shared_profile_title?.trim() || "AWN Member",
    avatar: row.shared_profile_avatar_url ?? undefined,
  }
}

export function personToSharePayload(
  person: Pick<
    Person,
    | "id"
    | "name"
    | "role"
    | "department"
    | "homeBase"
    | "availability"
    | "avatar"
    | "credits"
    | "vouches"
    | "yearsExperience"
  >,
): MemberSharePayload {
  return {
    id: person.id,
    name: person.name,
    role: person.role,
    department: person.department,
    homeBase: person.homeBase,
    availability: person.availability,
    avatar: person.avatar,
    credits: person.credits,
    vouches: person.vouches,
    yearsExperience: person.yearsExperience,
  }
}

export function memberSharePreviewText(memberShare: MemberSharePayload): string {
  return `Shared a member · ${memberShare.name}`
}

export function messageDisplayPreview(
  text: string,
  jobShare?: JobSharePayload,
  memberShare?: MemberSharePayload,
): string {
  const trimmed = text.trim()
  if (trimmed) return trimmed
  if (jobShare) return jobSharePreviewText(jobShare)
  if (memberShare) return memberSharePreviewText(memberShare)
  return ""
}
