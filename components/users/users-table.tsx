"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { MoreHorizontal, Search, ShieldCheck } from "lucide-react"

import {
  initials,
  roleConfig,
  statusConfig,
  userRoles,
  userStatuses,
  type AdminUser,
  type UserRole,
  type UserStatus,
} from "@/lib/users-data"
import {
  bulkDeleteUsers,
  bulkUpdateRole,
  bulkUpdateStatus,
  deleteUser,
  updateUserStatus,
} from "@/lib/users/actions"
import { cn } from "@/lib/utils"
import { EditUserDialog } from "@/components/users/edit-user-dialog"
import {
  getPaginationSlice,
  TablePaginationControls,
} from "@/components/table-pagination"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const ALL = "all"

type ConfirmState =
  | { type: "delete"; ids: string[]; names: string[] }
  | { type: "suspend"; ids: string[] }
  | null

export function UsersTable({
  initialUsers,
  loadError,
}: {
  initialUsers: AdminUser[]
  loadError?: string | null
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<UserRole | typeof ALL>(ALL)
  const [statusFilter, setStatusFilter] = useState<UserStatus | typeof ALL>(ALL)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [bulkRole, setBulkRole] = useState<UserRole | "">("")
  const [confirm, setConfirm] = useState<ConfirmState>(null)
  const [page, setPage] = useState(1)

  const q = query.trim().toLowerCase()

  const filtered = useMemo(() => {
    return initialUsers.filter((u) => {
      if (roleFilter !== ALL && u.role !== roleFilter) return false
      if (statusFilter !== ALL && u.status !== statusFilter) return false
      if (!q) return true
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.title.toLowerCase().includes(q)
      )
    })
  }, [initialUsers, q, roleFilter, statusFilter])

  const { paginated, totalPages, rangeStart, rangeEnd, showPagination } =
    getPaginationSlice(filtered, page)

  useEffect(() => {
    setPage(1)
  }, [q, roleFilter, statusFilter])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const allPageSelected =
    paginated.length > 0 && paginated.every((u) => selected.has(u.id))
  const somePageSelected = paginated.some((u) => selected.has(u.id))

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allPageSelected) {
        paginated.forEach((u) => next.delete(u.id))
      } else {
        paginated.forEach((u) => next.add(u.id))
      }
      return next
    })
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function clearSelection() {
    setSelected(new Set())
  }

  function runAction(
    promise: Promise<{ ok: true } | { ok: false; error: string }>,
    successMessage: string,
  ) {
    startTransition(async () => {
      const result = await promise
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(successMessage)
      clearSelection()
      setConfirm(null)
      setEditUser(null)
      router.refresh()
    })
  }

  function handleConfirm() {
    if (!confirm) return
    if (confirm.type === "delete") {
      const ids = confirm.ids
      runAction(
        ids.length === 1 ? deleteUser(ids[0]!) : bulkDeleteUsers(ids),
        ids.length === 1 ? "User deleted" : `${ids.length} users deleted`,
      )
      return
    }
    runAction(
      confirm.ids.length === 1
        ? updateUserStatus(confirm.ids[0]!, "Suspended")
        : bulkUpdateStatus(confirm.ids, "Suspended"),
      confirm.ids.length === 1
        ? "User suspended"
        : `${confirm.ids.length} users suspended`,
    )
  }

  const selectedIds = [...selected]

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      {loadError ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {loadError} Sign in as an Owner or Admin after applying the profiles
          migration and promoting your account.
        </div>
      ) : null}

      {/* Toolbar: search and filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={roleFilter}
            onValueChange={(v) => setRoleFilter(v as UserRole | typeof ALL)}
          >
            <SelectTrigger className="w-36" aria-label="Filter by role">
              <SelectValue>
                {(value) => (value === ALL ? "All roles" : value)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All roles</SelectItem>
              {userRoles.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(v) =>
              setStatusFilter(v as UserStatus | typeof ALL)
            }
          >
            <SelectTrigger className="w-36" aria-label="Filter by status">
              <SelectValue>
                {(value) => (value === ALL ? "All statuses" : value)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All statuses</SelectItem>
              {userStatuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Selection summary / bulk bar */}
      <div className="flex min-h-5 flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {selected.size > 0 ? (
          <>
            <span>
              {selected.size} selected of {initialUsers.length} users
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={bulkRole || undefined}
                onValueChange={(v) => {
                  const role = v as UserRole
                  setBulkRole(role)
                  runAction(
                    bulkUpdateRole(selectedIds, role),
                    `Updated role to ${role}`,
                  )
                  setBulkRole("")
                }}
              >
                <SelectTrigger
                  className="h-8 w-36"
                  aria-label="Bulk set role"
                  disabled={isPending}
                >
                  <SelectValue placeholder="Set role…" />
                </SelectTrigger>
                <SelectContent>
                  {userRoles.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="outline"
                disabled={isPending}
                onClick={() =>
                  setConfirm({ type: "suspend", ids: selectedIds })
                }
              >
                Suspend
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={isPending}
                onClick={() =>
                  runAction(
                    bulkUpdateStatus(selectedIds, "Active"),
                    "Users reactivated",
                  )
                }
              >
                Reactivate
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={isPending}
                onClick={() => {
                  const names = initialUsers
                    .filter((u) => selected.has(u.id))
                    .map((u) => u.name)
                  setConfirm({ type: "delete", ids: selectedIds, names })
                }}
              >
                Delete
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearSelection}
                disabled={isPending}
              >
                Clear
              </Button>
            </div>
          </>
        ) : (
          <span>
            Showing {rangeStart}–{rangeEnd} of {filtered.length}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="min-w-0 overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">
                <Checkbox
                  checked={allPageSelected}
                  indeterminate={!allPageSelected && somePageSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all users on this page"
                  disabled={paginated.length === 0 || isPending}
                />
              </TableHead>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">2FA</TableHead>
              <TableHead className="hidden lg:table-cell">Last active</TableHead>
              <TableHead className="w-10 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((user) => (
              <UserRowItem
                key={user.id}
                user={user}
                selected={selected.has(user.id)}
                onToggle={() => toggleOne(user.id)}
                disabled={isPending}
                onEdit={() => setEditUser(user)}
                onSuspend={() =>
                  setConfirm({ type: "suspend", ids: [user.id] })
                }
                onReactivate={() =>
                  runAction(
                    updateUserStatus(user.id, "Active"),
                    "User reactivated",
                  )
                }
                onDelete={() =>
                  setConfirm({
                    type: "delete",
                    ids: [user.id],
                    names: [user.name],
                  })
                }
              />
            ))}
            {filtered.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  {initialUsers.length === 0
                    ? "No users yet. Add someone to get started."
                    : "No users match your filters."}
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      {showPagination ? (
        <TablePaginationControls
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          disabled={isPending}
        />
      ) : null}

      <EditUserDialog
        user={editUser}
        open={Boolean(editUser)}
        onOpenChange={(open) => {
          if (!open) setEditUser(null)
        }}
      />

      <AlertDialog
        open={Boolean(confirm)}
        onOpenChange={(open) => {
          if (!open) setConfirm(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm?.type === "delete" ? "Delete users?" : "Suspend users?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.type === "delete"
                ? confirm.names.length === 1
                  ? `Permanently delete ${confirm.names[0]}? This removes their auth account and profile.`
                  : `Permanently delete ${confirm.names.length} users? This removes their auth accounts and profiles.`
                : confirm?.ids.length === 1
                  ? "Suspend this user? They will lose access until reactivated."
                  : `Suspend ${confirm?.ids.length ?? 0} users? They will lose access until reactivated.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant={confirm?.type === "delete" ? "destructive" : "default"}
              disabled={isPending}
              onClick={handleConfirm}
            >
              {confirm?.type === "delete" ? "Delete" : "Suspend"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function UserRowItem({
  user,
  selected,
  onToggle,
  disabled,
  onEdit,
  onSuspend,
  onReactivate,
  onDelete,
}: {
  user: AdminUser
  selected: boolean
  onToggle: () => void
  disabled?: boolean
  onEdit: () => void
  onSuspend: () => void
  onReactivate: () => void
  onDelete: () => void
}) {
  return (
    <TableRow data-state={selected ? "selected" : undefined}>
      <TableCell>
        <Checkbox
          checked={selected}
          onCheckedChange={onToggle}
          aria-label={`Select ${user.name}`}
          disabled={disabled}
        />
      </TableCell>
      <TableCell>
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-9">
            {user.avatar ? (
              <AvatarImage src={user.avatar} alt="" />
            ) : null}
            <AvatarFallback>{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium">{user.name}</span>
            <span className="truncate text-sm text-muted-foreground">
              {user.email}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={roleConfig[user.role].variant}>{user.role}</Badge>
      </TableCell>
      <TableCell>
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "size-1.5 rounded-full",
              statusConfig[user.status].dot,
            )}
            aria-hidden
          />
          {user.status}
        </span>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {user.twoFactor ? (
          <span className="flex items-center gap-1.5 text-sm">
            <ShieldCheck
              data-icon="inline-start"
              className="size-4 text-primary"
            />
            On
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">Off</span>
        )}
      </TableCell>
      <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
        {user.lastActive}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Actions for ${user.name}`}
                disabled={disabled}
              >
                <MoreHorizontal />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
            {user.status === "Suspended" ? (
              <DropdownMenuItem onClick={onReactivate}>
                Reactivate
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem variant="destructive" onClick={onSuspend}>
                Suspend
              </DropdownMenuItem>
            )}
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
