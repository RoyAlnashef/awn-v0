"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import {
  createInitialAccountDraft,
  createInitialTourCredits,
  type AccountTourCredit,
} from "@/lib/account-profile"
import type { Person } from "@/lib/people-data"

interface AccountProfileContextValue {
  draft: Person
  updateDraft: (patch: Partial<Person>) => void
  tourCredits: AccountTourCredit[]
  setTourCredits: React.Dispatch<React.SetStateAction<AccountTourCredit[]>>
}

const AccountProfileContext = createContext<AccountProfileContextValue | null>(
  null,
)

export function AccountProfileProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<Person>(createInitialAccountDraft)
  const [tourCredits, setTourCredits] = useState<AccountTourCredit[]>(
    createInitialTourCredits,
  )

  const updateDraft = useCallback((patch: Partial<Person>) => {
    setDraft((prev) => ({ ...prev, ...patch }))
  }, [])

  const value = useMemo(
    () => ({ draft, updateDraft, tourCredits, setTourCredits }),
    [draft, updateDraft, tourCredits],
  )

  return (
    <AccountProfileContext.Provider value={value}>
      {children}
    </AccountProfileContext.Provider>
  )
}

export function useAccountProfile() {
  const context = useContext(AccountProfileContext)
  if (!context) {
    throw new Error("useAccountProfile must be used within AccountProfileProvider")
  }
  return context
}
