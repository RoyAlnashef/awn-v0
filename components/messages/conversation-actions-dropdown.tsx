"use client"

import { useState, type MouseEvent } from "react"
import {
  Archive,
  ArchiveRestore,
  BellOff,
  EllipsisVertical,
  Mail,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { type DirectConversation } from "@/lib/messages-data"
import { isPersistedConversation } from "@/lib/messages/format"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type ActionResult = { ok: true } | { ok: false; error: string }

export function ConversationActionsDropdown({
  conversation,
  showArchivedList = false,
  isActiveThread = false,
  onToggleMute,
  onToggleArchive,
  onMarkUnread,
  onRequestDelete,
  disabled = false,
}: {
  conversation: DirectConversation
  showArchivedList?: boolean
  isActiveThread?: boolean
  onToggleMute?: (
    conversationId: string,
    muted: boolean,
  ) => Promise<ActionResult>
  onToggleArchive?: (
    conversationId: string,
    archived: boolean,
  ) => Promise<ActionResult>
  onMarkUnread?: (
    conversationId: string,
    isActiveThread: boolean,
  ) => Promise<ActionResult>
  onRequestDelete?: (conversation: DirectConversation) => void
  disabled?: boolean
}) {
  const [pendingAction, setPendingAction] = useState<
    "mute" | "archive" | "unread" | null
  >(null)

  if (!isPersistedConversation(conversation)) return null

  async function handleToggleMute(e: MouseEvent) {
    e.stopPropagation()
    if (pendingAction || !onToggleMute) return
    setPendingAction("mute")
    try {
      const result = await onToggleMute(
        conversation.id,
        Boolean(conversation.muted),
      )
      if (!result.ok) toast.error(result.error)
    } finally {
      setPendingAction(null)
    }
  }

  async function handleToggleArchive(e: MouseEvent) {
    e.stopPropagation()
    if (pendingAction || !onToggleArchive) return
    setPendingAction("archive")
    try {
      const result = await onToggleArchive(
        conversation.id,
        showArchivedList || Boolean(conversation.archived),
      )
      if (!result.ok) toast.error(result.error)
    } finally {
      setPendingAction(null)
    }
  }

  async function handleMarkUnread(e: MouseEvent) {
    e.stopPropagation()
    if (pendingAction || !onMarkUnread || conversation.unread) return
    setPendingAction("unread")
    try {
      const result = await onMarkUnread(conversation.id, isActiveThread)
      if (!result.ok) toast.error(result.error)
    } finally {
      setPendingAction(null)
    }
  }

  function handleDeleteRequest(e: MouseEvent) {
    e.stopPropagation()
    onRequestDelete?.(conversation)
  }

  const archived = showArchivedList || Boolean(conversation.archived)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-foreground"
            aria-label={`Actions for ${conversation.name}`}
            disabled={disabled || !!pendingAction}
            onClick={(e) => e.stopPropagation()}
          >
            <EllipsisVertical />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={handleToggleMute}
          disabled={pendingAction === "mute"}
        >
          <BellOff />
          {conversation.muted ? "Unmute" : "Mute"}
        </DropdownMenuItem>
        {!conversation.unread && conversation.canMarkUnread ? (
          <DropdownMenuItem
            onClick={handleMarkUnread}
            disabled={pendingAction === "unread"}
          >
            <Mail />
            Mark as unread
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem
          onClick={handleToggleArchive}
          disabled={pendingAction === "archive"}
        >
          {archived ? <ArchiveRestore /> : <Archive />}
          {archived ? "Unarchive" : "Archive"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={handleDeleteRequest}
        >
          <Trash2 />
          Delete for me
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
