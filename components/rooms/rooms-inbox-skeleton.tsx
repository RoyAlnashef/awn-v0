import { Skeleton } from "@/components/ui/skeleton"

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Skeleton className="size-10 shrink-0 rounded-lg" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-8 w-16 shrink-0 rounded-md" />
    </div>
  )
}

export function RoomsInboxSkeleton() {
  return (
    <div
      className="flex flex-col"
      aria-busy="true"
      aria-label="Loading rooms"
    >
      {Array.from({ length: 8 }, (_, index) => (
        <SkeletonRow key={index} />
      ))}
    </div>
  )
}
