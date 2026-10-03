import type { createClient } from "@/lib/supabase/server"

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

/** Whether an authenticated viewer may load an incognito member outside discovery. */
export async function viewerMaySeeIncognitoProfile(
  viewerId: string,
  targetId: string,
  supabase: SupabaseClient,
): Promise<boolean> {
  if (viewerId === targetId) {
    return true
  }

  const { data: dmRows, error: dmError } = await supabase
    .from("dm_participants")
    .select("conversation_id")
    .eq("profile_id", viewerId)

  if (dmError || !dmRows?.length) {
    // continue to room check
  } else {
    const conversationIds = dmRows.map((row) => row.conversation_id as string)
    const { data: partnerRow, error: partnerError } = await supabase
      .from("dm_participants")
      .select("conversation_id")
      .eq("profile_id", targetId)
      .in("conversation_id", conversationIds)
      .limit(1)
      .maybeSingle()

    if (!partnerError && partnerRow) {
      return true
    }
  }

  const { data: viewerRooms, error: viewerRoomsError } = await supabase
    .from("room_memberships")
    .select("room_id")
    .eq("profile_id", viewerId)

  if (viewerRoomsError || !viewerRooms?.length) {
    return false
  }

  const roomIds = viewerRooms.map((row) => row.room_id as string)
  const { data: sharedRoom, error: sharedRoomError } = await supabase
    .from("room_memberships")
    .select("room_id")
    .eq("profile_id", targetId)
    .in("room_id", roomIds)
    .limit(1)
    .maybeSingle()

  return !sharedRoomError && Boolean(sharedRoom)
}
