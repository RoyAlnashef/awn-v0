import { PageShell } from "@/components/page-shell"
import { PeopleBoard } from "@/components/people/people-board"
import { mainNav } from "@/lib/nav"

const item = mainNav.find((i) => i.href === "/people")!

export default function PeoplePage() {
  return (
    <PageShell title="Find people" description={item.description}>
      <PeopleBoard />
    </PageShell>
  )
}
