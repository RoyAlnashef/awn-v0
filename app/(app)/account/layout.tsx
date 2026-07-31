import type { ReactNode } from "react"

import { AccountLayoutShell } from "@/components/account/account-layout-shell"

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <AccountLayoutShell>{children}</AccountLayoutShell>
}
