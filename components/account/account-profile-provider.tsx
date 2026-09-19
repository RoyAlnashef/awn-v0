"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react"
import { toast } from "sonner"

import type { AccountTourCredit } from "@/lib/account-profile"
import { updateMemberProfile } from "@/lib/account/profile-actions"
import type { Person } from "@/lib/people-data"

interface AccountProfileContextValue {
  userId: string
  online: boolean
  draft: Person
  hasDraftChanges: boolean
  isSaving: boolean
  updateDraft: (patch: Partial<Person>) => void
  resetDraft: () => void
  saveDraft: () => void
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
  const [isSaving, startSaveTransition] = useTransition()

  const hasDraftChanges = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(saved),
    [draft, saved],
  )

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

  const saveDraft = useCallback(() => {
    startSaveTransition(async () => {
      const result = await updateMemberProfile(draft)
      if (!result.ok) {
        toast.error(result.error)
        return
      }

      if (result.person) {
        commitSaved(result.person)
      }
      toast.success("Profile saved")
    })
  }, [draft, commitSaved])

  const value = useMemo(
    () => ({
      userId,
      online: initialOnline,
      draft,
      hasDraftChanges,
      isSaving,
      updateDraft,
      resetDraft,
      saveDraft,
      commitSaved,
      commitSavedPatch,
      tourCredits,
      setTourCredits,
    }),
    [
      userId,
      initialOnline,
      draft,
      hasDraftChanges,
      isSaving,
      updateDraft,
      resetDraft,
      saveDraft,
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
