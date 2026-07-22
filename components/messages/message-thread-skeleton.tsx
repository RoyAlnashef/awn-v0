import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

const rows = [
  { align: "start" as const, width: "w-48" },
  { align: "end" as const, width: "w-36" },
  { align: "start" as const, width: "w-56" },
  { align: "end" as const, width: "w-44" },
  { align: "start" as const, width: "w-40" },
]

function SkeletonRow({
  align,
  width,
}: {
  align: "start" | "end"
  width: string
}) {
  const mine = align === "end"

  return (
    <div
      className={cn(
        "flex w-full gap-2",
        mine && "flex-row-reverse",
      )}
    >
      <Skeleton className="size-8 shrink-0 rounded-full" />
      <div className={cn("flex flex-col gap-1.5", mine && "items-end")}>
        <Skeleton className={cn("h-10 rounded-2xl", width)} />
        <Skeleton className="h-3 w-10 rounded-md" />
      </div>
    </div>
  )
}

export function MessageThreadSkeleton() {
  return (
    <div
      className="flex flex-col gap-4 py-4"
      aria-busy="true"
      aria-label="Loading messages"
    >
      {rows.map((row, index) => (
        <SkeletonRow key={index} align={row.align} width={row.width} />
      ))}
    </div>
  )
}
