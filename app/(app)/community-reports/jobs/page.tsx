import { JobReportsTable } from "@/components/reports/job-reports-table"
import { listJobReports } from "@/lib/moderation/actions"

export default async function CommunityReportsJobsPage() {
  const result = await listJobReports()

  return (
    <JobReportsTable
      initialReports={result.ok ? result.reports : []}
      loadError={result.ok ? null : result.error}
    />
  )
}
