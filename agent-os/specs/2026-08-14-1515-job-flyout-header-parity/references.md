# References for Job Flyout Header Parity

## Similar Implementations

### Job Card (reference layout)

- **Location:** `components/jobs/job-card.tsx`
- **Relevance:** Target header structure — title + urgent, tour name, `JobMetadataBadges`, footer pay rate
- **Key patterns:** Inline urgent badge with title, secondary-variant badges, stretched trigger for drawer

### JobMetadataBadges

- **Location:** `components/jobs/job-metadata-badges.tsx`
- **Relevance:** Shared badge row used by card, row, and now flyout/preview
- **Key patterns:** Uniform secondary badges, icon + label for date/location/posted-at

### JobDetailContent

- **Location:** `components/jobs/job-detail-content.tsx`
- **Relevance:** Single body shared by detail drawer, preview panel, and preview drawer
- **Key patterns:** Hero ref for focus, preview/embedded modes, scroll body + fixed footer

### Job Detail Drawer (prior spec)

- **Location:** `agent-os/specs/2026-07-28-1600-job-detail-drawer/`
- **Relevance:** Original flyout architecture and PersonProfileDrawer layout reference
- **Key patterns:** Right-side drawer, hero + ScrollArea + footer
