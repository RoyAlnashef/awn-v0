"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { UserPlus } from "lucide-react"

import { userRoles, type UserRole } from "@/lib/users-data"
import { createUser } from "@/lib/users/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string
  children: React.ReactNode
}) {
  return (
    <Label
      htmlFor={htmlFor}
      className="gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase"
    >
      {children}
    </Label>
  )
}

export function InviteUserDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [role, setRole] = React.useState<UserRole>("Member")
  const [pending, setPending] = React.useState(false)

  function reset() {
    setName("")
    setEmail("")
    setPassword("")
    setRole("Member")
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setPending(true)
    try {
      const result = await createUser({ name, email, password, role })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(`Created account for ${email.trim()}`)
      reset()
      onOpenChange(false)
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset()
        onOpenChange(next)
      }}
    >
      <DialogContent>
        <form onSubmit={handleSubmit} className="grid gap-6">
          <DialogHeader>
            <DialogTitle>Add user</DialogTitle>
            <DialogDescription>
              Create an account with email and password. They can sign in right
              away.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <FieldLabel htmlFor="invite-name">Full name</FieldLabel>
              <Input
                id="invite-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jordan Reyes"
                required
                autoComplete="name"
              />
            </div>
            <div className="grid gap-2">
              <FieldLabel htmlFor="invite-email">Email</FieldLabel>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jordan@example.com"
                required
                autoComplete="off"
              />
            </div>
            <div className="grid gap-2">
              <FieldLabel htmlFor="invite-password">Password</FieldLabel>
              <Input
                id="invite-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div className="grid gap-2">
              <FieldLabel>Role</FieldLabel>
              <Select
                value={role}
                onValueChange={(v) => setRole(v as UserRole)}
              >
                <SelectTrigger className="w-full" aria-label="User role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {userRoles.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              <UserPlus data-icon="inline-start" />
              {pending ? "Creating…" : "Create user"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
