# Job Report, Hide, and Admin Under Review

See implementation in repo; shaped from job report/hide + Under Review admin lock (Oct 2026).

## Summary

- Member: flag-first footer drop-up → Report job / Hide job; report slide-up with product form reasons; hide from board only.
- Data: `job_reports`, `job_board_hides`, review columns on `job_postings`.
- Admin: `/community-reports/jobs` — dismiss, put under review, suspend poster; when in review — release or close job.
- Under Review: admin-triggered only; pauses job (`draft`); blocks poster mutations until release (restore status) or close (`filled`/`deleted`).

## Tasks

1. Spec documentation
2. Migration
3. Member moderation + board filter
4. Admin review server actions
5. Poster API guards
6. Job detail footer UX
7. Admin table + poster read-only UX
8. Browser verification
