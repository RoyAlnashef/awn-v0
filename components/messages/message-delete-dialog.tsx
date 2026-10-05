"use client"

import { Trash2 } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const copy = {
  unsend: {
    title: "Unsend message?",
    description:
      "This will remove the message for everyone in this conversation.",
    confirm: "Unsend",
  },
  delete: {
    title: "Delete message?",
    description: "This will remove the message for everyone in this group.",
    confirm: "Delete",
  },
  hide: {
    title: "Delete for you?",
    description:
      "This removes the message from your thread only. The other person can still see it.",
    confirm: "Delete for me",
  },
} as const

export function MessageDeleteDialog({
  open,
  onOpenChange,
  variant,
  pending = false,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  variant: "unsend" | "delete" | "hide"
  pending?: boolean
  onConfirm: () => void
}) {
  const labels = copy[variant]

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{labels.title}</AlertDialogTitle>
          <AlertDialogDescription>{labels.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending}
            onClick={onConfirm}
          >
            {labels.confirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
