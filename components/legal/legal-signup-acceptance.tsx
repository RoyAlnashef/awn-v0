"use client"

import Link from "next/link"

import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import {
  LEGAL_DOCUMENTS,
  type LegalDocumentKey,
} from "@/lib/legal/documents"

type LegalSignupAcceptanceProps = {
  checked: Record<LegalDocumentKey, boolean>
  onCheckedChange: (key: LegalDocumentKey, value: boolean) => void
  disabled?: boolean
}

function getSignupDocumentLabel(key: LegalDocumentKey, title: string) {
  return key === "job-posting-policy" ? "Job Posting Guidelines" : title
}

export function LegalSignupAcceptance({
  checked,
  onCheckedChange,
  disabled = false,
}: LegalSignupAcceptanceProps) {
  return (
    <FieldSet disabled={disabled} className="gap-5">
      <FieldGroup data-slot="checkbox-group" className="gap-5">
        {LEGAL_DOCUMENTS.map((entry) => {
          const inputId = `legal-signup-${entry.key}`
          const isChecked = checked[entry.key]

          return (
            <Field key={entry.key} orientation="horizontal">
              <Checkbox
                id={inputId}
                checked={isChecked}
                onCheckedChange={(value) =>
                  onCheckedChange(entry.key, value === true)
                }
                disabled={disabled}
              />
              <FieldContent>
                <FieldLabel htmlFor={inputId} className="font-medium">
                  I accept the{" "}
                  <Link
                    href={entry.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {getSignupDocumentLabel(entry.key, entry.document.title)}
                  </Link>
                </FieldLabel>
                <FieldDescription>{entry.signupSummary}</FieldDescription>
              </FieldContent>
            </Field>
          )
        })}
      </FieldGroup>
    </FieldSet>
  )
}
