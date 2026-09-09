import { PageShell } from "@/components/page-shell"
import { PeopleBoard } from "@/components/people/people-board"
import { InvitePopoverTrigger } from "@/components/invites/invite-popover"
import { mainNav } from "@/lib/nav"
import { listDirectoryMembers } from "@/lib/people/actions"

const item = mainNav.find((i) => i.href === "/people")!

export default async function PeoplePage() {
  const result = await listDirectoryMembers()

  return (
    <PageShell
      title="Find people"
      description={item.description}
      actions={<InvitePopoverTrigger />}
    >
      <PeopleBoard
        initialPeople={result.ok ? result.people : []}
        loadError={result.ok ? null : result.error}
      />
    </PageShell>
  )
}
