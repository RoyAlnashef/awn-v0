import {
  Baby,
  Brain,
  Camera,
  ClipboardList,
  Guitar,
  Hash,
  HandHelping,
  LifeBuoy,
  Lightbulb,
  Music,
  Route,
  Speaker,
  Sparkles,
  Truck,
  type LucideIcon,
} from "lucide-react"

const ICON_MAP: Record<string, LucideIcon> = {
  baby: Baby,
  brain: Brain,
  camera: Camera,
  "clipboard-list": ClipboardList,
  guitar: Guitar,
  hash: Hash,
  "hand-helping": HandHelping,
  "life-buoy": LifeBuoy,
  lightbulb: Lightbulb,
  music: Music,
  route: Route,
  speaker: Speaker,
  sparkles: Sparkles,
  truck: Truck,
}

export function getRoomIcon(iconSlug: string): LucideIcon {
  return ICON_MAP[iconSlug] ?? Hash
}

export const ROOM_ICON_OPTIONS: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "hash", label: "Hash", icon: Hash },
  { value: "music", label: "Music", icon: Music },
  { value: "speaker", label: "Audio", icon: Speaker },
  { value: "guitar", label: "Guitar / Backline", icon: Guitar },
  { value: "lightbulb", label: "Lighting", icon: Lightbulb },
  { value: "camera", label: "Camera", icon: Camera },
  { value: "clipboard-list", label: "Clipboard", icon: ClipboardList },
  { value: "life-buoy", label: "Help", icon: LifeBuoy },
  { value: "hand-helping", label: "Helping Hand", icon: HandHelping },
  { value: "brain", label: "Brain / Mental Health", icon: Brain },
  { value: "baby", label: "Family", icon: Baby },
  { value: "truck", label: "Truck / Road", icon: Truck },
  { value: "route", label: "Route", icon: Route },
  { value: "sparkles", label: "Sparkles", icon: Sparkles },
]
