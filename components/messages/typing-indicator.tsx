import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ui/message"
import { cn } from "@/lib/utils"

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 px-0.5 py-0.5" aria-hidden>
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="size-1.5 rounded-full bg-muted-foreground/40 animate-typing-dot"
          style={{ animationDelay: `${index * 0.2}s` }}
        />
      ))}
    </span>
  )
}

export function TypingIndicator({
  name,
  avatarUrl,
  className,
}: {
  name: string
  avatarUrl?: string | null
  className?: string
}) {
  return (
    <Message
      align="start"
      className={className}
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">{name} is typing</span>
      <MessageAvatar>
        <Avatar className="size-8">
          <AvatarImage src={avatarUrl || undefined} alt="" />
          <AvatarFallback>{initials(name)}</AvatarFallback>
        </Avatar>
      </MessageAvatar>
      <MessageContent>
        <Bubble variant="muted" align="start" className={cn("max-w-full")}>
          <BubbleContent>
            <TypingDots />
          </BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  )
}
