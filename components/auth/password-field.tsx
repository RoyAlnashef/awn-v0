"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"

export function PasswordField({
  id,
  label,
  value,
  onChange,
  disabled,
  autoComplete = "current-password",
  minLength,
  labelExtra,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  autoComplete?: "current-password" | "new-password"
  minLength?: number
  labelExtra?: React.ReactNode
}) {
  const [visible, setVisible] = React.useState(false)

  return (
    <div className="grid gap-2">
      <div
        className={
          labelExtra ? "flex items-center justify-between" : undefined
        }
      >
        <Label htmlFor={id}>{label}</Label>
        {labelExtra}
      </div>
      <InputGroup>
        <InputGroupInput
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          minLength={minLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          disabled={disabled}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            variant="ghost"
            aria-label={visible ? "Hide password" : "Show password"}
            onClick={() => setVisible((current) => !current)}
            disabled={disabled}
          >
            {visible ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
