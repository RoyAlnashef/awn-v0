export type ChecklistItemId =
  | "profile"
  | "join-group"
  | "connect"
  | "invite"
  | "help-now"
  | "create-job"
  | "apply-job"

export type ChecklistItem = {
  id: ChecklistItemId
  title: string
  description: string
  highlighted?: boolean
}

export const checklistItems: ChecklistItem[] = [
  {
    id: "profile",
    title: "Edit your profile",
    description:
      "Name and role come from signup. Open your profile, make a change, and save it.",
  },
  {
    id: "join-group",
    title: "Join a group",
    description:
      "Find your people. Join a discipline or crew group to stay in the loop.",
  },
  {
    id: "connect",
    title: "Connect with a member",
    description:
      "Send a connection request to someone in the People directory.",
  },
  {
    id: "invite",
    title: "Send an invite",
    description:
      "Bring someone you trust onto AWN so you can stay connected on the road.",
  },
  {
    id: "help-now",
    title: "Post a Help Now request",
    description:
      "Try a 24-hour urgent callout — visible to available members near you.",
    highlighted: true,
  },
  {
    id: "create-job",
    title: "Create a job",
    description:
      "Post a role to the job board and get it in front of available crew.",
  },
  {
    id: "apply-job",
    title: "Apply to a job",
    description:
      "Browse the board and send your first application to a posted role.",
  },
]
