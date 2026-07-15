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
    />
  )
}
