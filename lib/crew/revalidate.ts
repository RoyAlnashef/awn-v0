import { revalidatePath } from "next/cache"

export function revalidateCrewProfilePaths(
  handle?: string | null,
  previousHandle?: string | null,
) {
  revalidatePath("/crew", "layout")

  for (const pathHandle of [handle, previousHandle]) {
    const trimmed = pathHandle?.trim()
    if (trimmed) {
      revalidatePath(`/crew/${trimmed}`)
    }
  }
}
