import { createClient } from "@/lib/supabase/server"

type BlockRow = {
  blocker_id: string
  blocked_id: string
}

/** Profile ids blocked with the viewer (either direction). */
export async function fetchBlockedProfileIdsForUser(
  userId: string,
): Promise<Set<string>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("member_blocks")
    .select("blocker_id, blocked_id")
    .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`)

  if (error || !data) {
    return new Set()
  }

  const blocked = new Set<string>()
  for (const row of data as BlockRow[]) {
    if (row.blocker_id === userId) {
      blocked.add(row.blocked_id)
    } else {
      blocked.add(row.blocker_id)
    }
  }

  return blocked
}

export async function membersAreBlocked(
  userId: string,
  otherProfileId: string,
): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc("members_are_blocked", {
    p_a: userId,
    p_b: otherProfileId,
  })

  if (error) {
    return false
  }

  return Boolean(data)
}
