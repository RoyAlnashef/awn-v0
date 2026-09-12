"use client"

import { BadgeCheck, UserMinus } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface FollowedMember {
  id: string
  name: string
  role: string
  homeBase: string
  avatar?: string
  verified?: boolean
}

const MOCK_FOLLOWING: FollowedMember[] = [
  {
    id: "1",
    name: "Priya Anand",
    role: "Front of House Engineer",
    homeBase: "London, UK",
    verified: true,
  },
  {
    id: "2",
    name: "Aisha Khan",
    role: "Stage Manager",
    homeBase: "New York, NY",
  },
  {
    id: "3",
    name: "Grace Kim",
    role: "Camera Operator",
    homeBase: "Seattle, WA",
    verified: true,
  },
  {
    id: "4",
    name: "Sam Torres",
    role: "Lighting Designer",
    homeBase: "Chicago, IL",
  },
  {
    id: "5",
    name: "Devon Park",
    role: "Production Manager",
    homeBase: "Nashville, TN",
    verified: true,
  },
  {
    id: "6",
    name: "Casey Flynn",
    role: "Monitor Engineer",
    homeBase: "Austin, TX",
  },
  {
    id: "7",
    name: "Liam O'Connor",
    role: "Systems Engineer",
    homeBase: "Dublin, IE",
  },
  {
    id: "8",
    name: "Dana Whitfield",
    role: "Video Director",
    homeBase: "Atlanta, GA",
  },
  {
    id: "9",
    name: "Marcus Bell",
    role: "Lighting Director",
    homeBase: "Los Angeles, CA",
    verified: true,
  },
  {
    id: "10",
    name: "Riley Chen",
    role: "Audio Tech",
    homeBase: "San Francisco, CA",
  },
  {
    id: "11",
    name: "Nadia Solis",
    role: "Production Coordinator",
    homeBase: "Miami, FL",
  },
  {
    id: "12",
    name: "Tyler Brooks",
    role: "Rigger",
    homeBase: "Denver, CO",
  },
]

function memberInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
}

function MemberCard({ member }: { member: FollowedMember }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-4 text-center">
      <Avatar className="size-14">
        <AvatarImage src={member.avatar} alt="" />
        <AvatarFallback className="text-base">{memberInitials(member.name)}</AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-0.5">
        <div className="flex items-center justify-center gap-1">
          <span className="font-heading text-sm font-semibold leading-tight">
            {member.name}
          </span>
          {member.verified && (
            <BadgeCheck className="size-3.5 shrink-0 text-primary" aria-label="Verified" />
          )}
        </div>
        <span className="text-xs text-muted-foreground">{member.role}</span>
        <span className="text-xs text-muted-foreground">{member.homeBase}</span>
      </div>

      <Button
        variant="outline"
        size="xs"
        className="mt-auto w-full gap-1 text-muted-foreground hover:text-foreground"
      >
        <UserMinus className="size-3" />
        Disconnect
      </Button>
    </div>
  )
}

export function NetworkSection() {
  return (
    <div className="flex flex-col gap-6">
      <h3 className="font-heading text-base font-semibold">Connections</h3>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {MOCK_FOLLOWING.map((member) => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>
    </div>
  )
}
