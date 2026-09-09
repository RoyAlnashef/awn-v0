"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import type { EmailTheme } from "@/lib/email/templates/base"

type ClipboardCopy = {
  label: string
  value: string
}

type EmailPreviewContextValue = {
  html: string | null
  setHtml: (html: string | null) => void
  emptyMessage: string
  setEmptyMessage: (message: string) => void
  clipboardCopy: ClipboardCopy | null
  setClipboardCopy: (copy: ClipboardCopy | null) => void
  previewTheme: EmailTheme
  setPreviewTheme: (theme: EmailTheme) => void
  previewDrawerOpen: boolean
  setPreviewDrawerOpen: (open: boolean) => void
  openPreviewDrawer: () => void
}

const EmailPreviewContext = createContext<EmailPreviewContextValue | null>(null)

export function EmailPreviewProvider({ children }: { children: ReactNode }) {
  const [html, setHtmlState] = useState<string | null>(null)
  const [emptyMessage, setEmptyMessageState] = useState(
    "Select an item to preview.",
  )
  const [clipboardCopy, setClipboardCopyState] = useState<ClipboardCopy | null>(
    null,
  )
  const [previewTheme, setPreviewThemeState] = useState<EmailTheme>("dark")
  const [previewDrawerOpen, setPreviewDrawerOpenState] = useState(false)

  const setHtml = useCallback((next: string | null) => {
    setHtmlState(next)
  }, [])

  const setEmptyMessage = useCallback((message: string) => {
    setEmptyMessageState(message)
  }, [])

  const setClipboardCopy = useCallback((copy: ClipboardCopy | null) => {
    setClipboardCopyState(copy)
  }, [])

  const setPreviewTheme = useCallback((theme: EmailTheme) => {
    setPreviewThemeState(theme)
  }, [])

  const setPreviewDrawerOpen = useCallback((open: boolean) => {
    setPreviewDrawerOpenState(open)
  }, [])

  const openPreviewDrawer = useCallback(() => {
    setPreviewDrawerOpenState(true)
  }, [])

  const value = useMemo(
    () => ({
      html,
      setHtml,
      emptyMessage,
      setEmptyMessage,
      clipboardCopy,
      setClipboardCopy,
      previewTheme,
      setPreviewTheme,
      previewDrawerOpen,
      setPreviewDrawerOpen,
      openPreviewDrawer,
    }),
    [
      html,
      setHtml,
      emptyMessage,
      setEmptyMessage,
      clipboardCopy,
      setClipboardCopy,
      previewTheme,
      setPreviewTheme,
      previewDrawerOpen,
      setPreviewDrawerOpen,
      openPreviewDrawer,
    ],
  )

  return (
    <EmailPreviewContext.Provider value={value}>
      {children}
    </EmailPreviewContext.Provider>
  )
}

export function useEmailPreview() {
  const ctx = useContext(EmailPreviewContext)
  if (!ctx) {
    throw new Error("useEmailPreview must be used within EmailPreviewProvider")
  }
  return ctx
}
