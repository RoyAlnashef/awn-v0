# Standards for Jobs Backend + Wiring

## global/board-pattern

Preserve filter bar + result count + grid/list toggle. Data source switches from mock array to API; filter UX stays client-driven with query params passed to GET.

## global/page-shell

Jobs page uses `PageShell` with title, description, and `PostJobDialog` in actions slot — unchanged.

## Supabase migrations

- Manual-only header comment (never auto-executed by agents)
- Enums for constrained values
- RLS enabled on all new tables
- `security definer` helpers for policy checks where needed
- Indexes on foreign keys and common filter columns
