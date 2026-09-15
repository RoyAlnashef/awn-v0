"use server"

import { isUuid } from "@/lib/messages/format"
import { createClient } from "@/lib/supabase/server"

export type SetViewingRoomResult = { ok: true } | { ok: false; error: string }

export async function setViewingRoom(
  roomId: string | null,
): Promise<SetViewingRoomResult> {
  try {
    if (roomId !== null && !isUuid(roomId)) {
      return { ok: true }
    }

    const supabase = await createClient()
    const { error } = await supabase.rpc("set_viewing_room", {
      p_room_id: roomId,
    })

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true }
  } catch (error) {
    if (error instanceof Error) {
      return { ok: false, error: error.message }
    }
    return { ok: false, error: "Something went wrong." }
  }
}
