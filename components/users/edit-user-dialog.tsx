"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { userRoles, type AdminUser, type UserRole } from "@/lib/users-data"
import { updateUser } from "@/lib/users/actions"
import { PasswordField } from "@/components/auth/password-field"
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

export function EditUserDialog({
  user,
  open,
  onOpenChange,
}: {
  user: AdminUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [title, setTitle] = React.useState("")
  const [role, setRole] = React.useState<UserRole>("Member")
  const [password, setPassword] = React.useState("")
  const [pending, setPending] = React.useState(false)

  React.useEffect(() => {
    if (!user) return
    setName(user.name)
    setEmail(user.email)
    setTitle(user.title)
    setRole(user.role)
    setPassword("")
  }, [user])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!user) return

    setPending(true)
    try {
      const result = await updateUser(user.id, {
        name,
        email,
        title,
        role,
        ...(password.trim() ? { password: password.trim() } : {}),
      })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(
        password.trim()
          ? `Updated ${name.trim()} and reset password`
          : `Updated ${name.trim()}`,
      )
      onOpenChange(false)
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="grid gap-6">
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>
              {user
                ? `Update profile details for ${user.name}.`
                : null}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <FieldLabel htmlFor="edit-name">Full name</FieldLabel>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jordan Reyes"
                required
                autoComplete="name"
              />
            </div>
            <div className="grid gap-2">
              <FieldLabel htmlFor="edit-email">Email</FieldLabel>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jordan@example.com"
                required
                autoComplete="off"
              />
            </div>
            <div className="grid gap-2">
              <FieldLabel htmlFor="edit-title">Title</FieldLabel>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Production Manager"
                autoComplete="off"
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
            <div className="grid gap-2">
              <PasswordField
                id="edit-password"
                label="New password"
                value={password}
                onChange={setPassword}
                autoComplete="new-password"
                minLength={8}
                required={false}
                disabled={pending}
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to keep the current password.
              </p>
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
            <Button type="submit" disabled={pending || !user}>
              {pending ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
