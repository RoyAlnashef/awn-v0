"use client"

import { useMemo, useState } from "react"
import {
  MoreHorizontal,
  Search,
  ShieldCheck,
  UserPlus,
} from "lucide-react"

import {
  adminUsers,
  initials,
  roleConfig,
  statusConfig,
  userRoles,
  userStatuses,
  type AdminUser,
  type UserRole,
  type UserStatus,
} from "@/lib/users-data"
import { cn } from "@/lib/utils"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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

export function UsersTable() {
  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<UserRole | typeof ALL>(ALL)
  const [statusFilter, setStatusFilter] = useState<UserStatus | typeof ALL>(ALL)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const q = query.trim().toLowerCase()

  const filtered = useMemo(() => {
    return adminUsers.filter((u) => {
      if (roleFilter !== ALL && u.role !== roleFilter) return false
      if (statusFilter !== ALL && u.status !== statusFilter) return false
      if (!q) return true
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.title.toLowerCase().includes(q)
      )
    })
  }, [q, roleFilter, statusFilter])

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((u) => selected.has(u.id))
  const someVisibleSelected = filtered.some((u) => selected.has(u.id))

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allVisibleSelected) {
        filtered.forEach((u) => next.delete(u.id))
      } else {
        filtered.forEach((u) => next.add(u.id))
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

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      {/* Toolbar: search, filters, and primary action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
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
        <Button className="shrink-0">
          <UserPlus data-icon="inline-start" />
          Invite user
        </Button>
      </div>

      {/* Selection summary */}
      <div className="flex h-5 items-center text-sm text-muted-foreground">
        {selected.size > 0 ? (
          <span>
            {selected.size} selected of {adminUsers.length} users
          </span>
        ) : (
          <span>
            {filtered.length} of {adminUsers.length} users
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
                  checked={allVisibleSelected}
                  indeterminate={!allVisibleSelected && someVisibleSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all users"
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
            {filtered.map((user) => (
              <UserRowItem
                key={user.id}
                user={user}
                selected={selected.has(user.id)}
                onToggle={() => toggleOne(user.id)}
              />
            ))}
            {filtered.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  No users match your filters.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function UserRowItem({
  user,
  selected,
  onToggle,
}: {
  user: AdminUser
  selected: boolean
  onToggle: () => void
}) {
  return (
    <TableRow data-state={selected ? "selected" : undefined}>
      <TableCell>
        <Checkbox
          checked={selected}
          onCheckedChange={onToggle}
          aria-label={`Select ${user.name}`}
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
            <ShieldCheck data-icon="inline-start" className="size-4 text-primary" />
            On
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">Off</span>
        )}
      </TableCell>
      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
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
              >
                <MoreHorizontal />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
            <DropdownMenuItem>View profile</DropdownMenuItem>
            <DropdownMenuItem>Edit role</DropdownMenuItem>
            <DropdownMenuItem>
              {user.twoFactor ? "Reset 2FA" : "Require 2FA"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              {user.status === "Suspended" ? "Reactivate" : "Suspend"} user
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
