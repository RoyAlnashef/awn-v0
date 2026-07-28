"use client"

import { AvatarUploadField } from "@/components/users/avatar-upload-field"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function ProfileSettings({
  userId,
  name,
  avatarUrl,
}: {
  userId: string
  name: string
  avatarUrl?: string
}) {
  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Update how you appear across AWN.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AvatarUploadField
          userId={userId}
          name={name}
          avatarUrl={avatarUrl}
        />
      </CardContent>
    </Card>
  )
}
