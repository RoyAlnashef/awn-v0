import { NextResponse } from "next/server"

import { getPublicResumePath } from "@/lib/crew/public-profile"
import { createAdminClient } from "@/lib/supabase/admin"

const RESUME_BUCKET = "resumes"

type RouteContext = {
  params: Promise<{ handle: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { handle } = await context.params
  const resume = await getPublicResumePath(handle)

  if (!resume) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin.storage
    .from(RESUME_BUCKET)
    .createSignedUrl(resume.resumePath, 60 * 10, {
      download: resume.fileName,
    })

  if (error || !data?.signedUrl) {
    return NextResponse.json(
      { error: error?.message || "Could not download resume." },
      { status: 500 },
    )
  }

  return NextResponse.redirect(data.signedUrl, 302)
}
