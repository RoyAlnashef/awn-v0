"use server"

import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

export async function signOut() {
  const supabase = await createClient()
  await supabase.rpc("clear_last_active")
  await supabase.auth.signOut({ scope: "local" })
  redirect("/login")
}
