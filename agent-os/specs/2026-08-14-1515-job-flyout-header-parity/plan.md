# Job Flyout Header Parity

Align the top section of job flyouts and previews with the Job Card layout while keeping the flyout as the expanded detailed view.

## Target element order

1. Title + Urgent Help badge
2. Tour name
3. Badge row — Date, Location, Engagement, Department, Application deadline, Posted Date, Applicants
4. Pay rate (above Details)
5. Details (full description)
6. Posted By (sm contact card)
7. Footer

## Badge visibility

| Badge | Job Card | Flyout | Preview |
|-------|----------|--------|---------|
| Date, Location, Engagement, Department | yes | yes | yes |
| Application deadline | no | yes | yes |
| Posted Date | yes | yes | yes |
| Applicants | no | yes | no |

## Implementation

- Extend `JobMetadataBadges` with deadline and applicants props
- Restructure `JobDetailContent` hero to match Job Card
- Shrink Posted By contact card
- All badges uniform `variant="secondary"`

See attached plan in `.cursor/plans/` for full task breakdown.
