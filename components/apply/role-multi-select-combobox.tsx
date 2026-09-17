"use client"

import { toast } from "sonner"

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import { roleGroups } from "@/lib/jobs-data"

const groupedRoles = roleGroups.map((group) => ({
  value: group.department,
  items: group.roles,
}))

type RoleMultiSelectComboboxProps = {
  id?: string
  value: string[]
  onValueChange: (roles: string[]) => void
  maxSelections?: number
  disabled?: boolean
}

export function RoleMultiSelectCombobox({
  id,
  value,
  onValueChange,
  maxSelections = 5,
  disabled = false,
}: RoleMultiSelectComboboxProps) {
  const anchor = useComboboxAnchor()

  function handleValueChange(next: string[]) {
    if (next.length > maxSelections) {
      toast.error(`Choose up to ${maxSelections} roles.`)
      return
    }
    onValueChange(next)
  }

  return (
    <Combobox
      id={id}
      items={groupedRoles}
      multiple
      value={value}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <div ref={anchor}>
        <ComboboxChips>
          <ComboboxValue>
            {value.map((role) => (
              <ComboboxChip key={role}>{role}</ComboboxChip>
            ))}
          </ComboboxValue>
          {value.length < maxSelections ? (
            <ComboboxChipsInput
              placeholder={value.length === 0 ? "Search roles…" : "Add role…"}
              disabled={disabled}
            />
          ) : null}
        </ComboboxChips>
      </div>
      <ComboboxContent
        anchor={anchor}
        sideOffset={8}
        className="border border-border bg-secondary ring-1 ring-ring/40"
      >
        <ComboboxEmpty>No roles found.</ComboboxEmpty>
        <ComboboxList>
          {(group, index) => (
            <div key={group.value}>
              {index > 0 ? <ComboboxSeparator /> : null}
              <ComboboxGroup items={group.items}>
                <ComboboxLabel>{group.value}</ComboboxLabel>
                <ComboboxCollection>
                  {(role) => (
                    <ComboboxItem key={role} value={role}>
                      {role}
                    </ComboboxItem>
                  )}
                </ComboboxCollection>
              </ComboboxGroup>
            </div>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
