import { Skeleton } from "@/components/ui/skeleton"

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-8" />
        </div>
        <Skeleton className="h-3 w-full max-w-40" />
      </div>
    </div>
  )
}

export function MessagesInboxSkeleton() {
  return (
    <div
      className="flex flex-col"
      aria-busy="true"
      aria-label="Loading conversations"
    >
      {Array.from({ length: 5 }, (_, index) => (
        <SkeletonRow key={index} />
      ))}
    </div>
  )
}
