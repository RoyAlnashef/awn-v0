"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import type { AccountTourCredit } from "@/lib/account-profile"
import type { Person } from "@/lib/people-data"

interface AccountProfileContextValue {
  userId: string
  online: boolean
  draft: Person
  updateDraft: (patch: Partial<Person>) => void
  resetDraft: () => void
  commitSaved: (next: Person) => void
  commitSavedPatch: (patch: Partial<Person>) => void
  tourCredits: AccountTourCredit[]
  setTourCredits: React.Dispatch<React.SetStateAction<AccountTourCredit[]>>
}

const AccountProfileContext = createContext<AccountProfileContextValue | null>(
  null,
)

export function AccountProfileProvider({
  children,
  initialProfile,
  initialTourCredits,
  userId,
  initialOnline,
}: {
  children: ReactNode
  initialProfile: Person
  initialTourCredits: AccountTourCredit[]
  userId: string
  initialOnline: boolean
}) {
  const [saved, setSaved] = useState<Person>(initialProfile)
  const [draft, setDraft] = useState<Person>(initialProfile)
  const [tourCredits, setTourCredits] =
    useState<AccountTourCredit[]>(initialTourCredits)

  const updateDraft = useCallback((patch: Partial<Person>) => {
    setDraft((prev) => ({ ...prev, ...patch }))
  }, [])

  const resetDraft = useCallback(() => {
    setDraft(saved)
  }, [saved])

  const commitSaved = useCallback((next: Person) => {
    setSaved(next)
    setDraft(next)
  }, [])

  const commitSavedPatch = useCallback((patch: Partial<Person>) => {
    setSaved((prev) => ({ ...prev, ...patch }))
    setDraft((prev) => ({ ...prev, ...patch }))
  }, [])

  const value = useMemo(
    () => ({
      userId,
      online: initialOnline,
      draft,
      updateDraft,
      resetDraft,
      commitSaved,
      commitSavedPatch,
      tourCredits,
      setTourCredits,
    }),
    [
      userId,
      initialOnline,
      draft,
      updateDraft,
      resetDraft,
      commitSaved,
      commitSavedPatch,
      tourCredits,
    ],
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
