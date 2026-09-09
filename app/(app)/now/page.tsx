import { Radio, RefreshCw } from "lucide-react"

import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { mainNav } from "@/lib/nav"

const now = mainNav.find((item) => item.href === "/now")!

export default function NowPage() {
  return (
    <PageShell
      title="Good evening, Roy"
      description={now.description}
      actions={
        <>
          <Button variant="outline" size="sm">
            <RefreshCw />
            Refresh
          </Button>
          <Button size="sm">
            <Radio />
            Broadcast availability
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
        <div className="flex flex-col gap-4 lg:col-span-7">
          <div className="flex min-h-[60vh] flex-1 items-center justify-center rounded-xl border border-dashed">
            <p className="text-sm text-muted-foreground">
              Primary column (7)
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 lg:col-span-5">
          <div className="flex min-h-[60vh] flex-1 items-center justify-center rounded-xl border border-dashed">
            <p className="text-sm text-muted-foreground">
              Secondary column (5)
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
