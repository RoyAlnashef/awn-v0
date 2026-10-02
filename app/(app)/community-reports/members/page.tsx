import { MemberReportsTable } from "@/components/reports/member-reports-table"
import { listMemberReports } from "@/lib/moderation/actions"

export default async function CommunityReportsMembersPage() {
  const result = await listMemberReports()

  return (
    <MemberReportsTable
      initialReports={result.ok ? result.reports : []}
      loadError={result.ok ? null : result.error}
    />
  )
}
