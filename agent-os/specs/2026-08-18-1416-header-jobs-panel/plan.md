# Header Jobs Panel

See the attached plan in `.cursor/plans/header_jobs_panel_09492077.plan.md` for the full implementation plan.

## Summary

Add a Jobs icon to the site header (before Notifications) that opens a right-side Sheet panel. The panel shows a real-data Urgent Jobs carousel at the top and a mock notification-style list for saved-job updates, with a "Saved searches" coming-soon section.

## Tasks

1. Save spec documentation (this folder)
2. Extend jobs API with `kind` query param
3. Create mock jobs-panel notification data
4. Build panel subcomponents (carousel, notifications list, SWR hook)
5. Create header Jobs Sheet wrapper
6. Wire into site header
7. Smoke-check
