-- =============================================================================
-- Seed: jobs tables (sample postings, applications, saves)
--
-- IMPORTANT: Run manually in the Supabase SQL Editor AFTER:
--   1. create_profiles migration
--   2. create_jobs_tables migration
--   3. At least one active profile exists (your logged-in user is fine)
--
-- Safe to re-run: removes prior seed rows by fixed UUIDs before inserting.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Remove previous seed data (fixed job UUIDs below)
-- ---------------------------------------------------------------------------

delete from public.job_applications
where job_id = any(array[
  'a0000001-0000-4000-8000-000000000001'::uuid,
  'a0000002-0000-4000-8000-000000000002'::uuid,
  'a0000003-0000-4000-8000-000000000003'::uuid,
  'a0000004-0000-4000-8000-000000000004'::uuid,
  'a0000005-0000-4000-8000-000000000005'::uuid,
  'a0000006-0000-4000-8000-000000000006'::uuid,
  'a0000007-0000-4000-8000-000000000007'::uuid,
  'a0000008-0000-4000-8000-000000000008'::uuid,
  'a0000009-0000-4000-8000-000000000009'::uuid,
  'a000000a-0000-4000-8000-00000000000a'::uuid
]);

delete from public.saved_jobs
where job_id = any(array[
  'a0000001-0000-4000-8000-000000000001'::uuid,
  'a0000002-0000-4000-8000-000000000002'::uuid,
  'a0000003-0000-4000-8000-000000000003'::uuid,
  'a0000004-0000-4000-8000-000000000004'::uuid,
  'a0000005-0000-4000-8000-000000000005'::uuid,
  'a0000006-0000-4000-8000-000000000006'::uuid,
  'a0000007-0000-4000-8000-000000000007'::uuid,
  'a0000008-0000-4000-8000-000000000008'::uuid,
  'a0000009-0000-4000-8000-000000000009'::uuid,
  'a000000a-0000-4000-8000-00000000000a'::uuid
]);

delete from public.job_postings
where id = any(array[
  'a0000001-0000-4000-8000-000000000001'::uuid,
  'a0000002-0000-4000-8000-000000000002'::uuid,
  'a0000003-0000-4000-8000-000000000003'::uuid,
  'a0000004-0000-4000-8000-000000000004'::uuid,
  'a0000005-0000-4000-8000-000000000005'::uuid,
  'a0000006-0000-4000-8000-000000000006'::uuid,
  'a0000007-0000-4000-8000-000000000007'::uuid,
  'a0000008-0000-4000-8000-000000000008'::uuid,
  'a0000009-0000-4000-8000-000000000009'::uuid,
  'a000000a-0000-4000-8000-00000000000a'::uuid
]);

-- ---------------------------------------------------------------------------
-- Resolve poster profiles (cycles through active profiles)
-- ---------------------------------------------------------------------------

with posters as (
  select
    id,
    row_number() over (order by created_at, id) - 1 as idx
  from public.profiles
  where status = 'active'::public.user_status
),
poster_count as (
  select count(*)::int as total from posters
),
seed_jobs as (
  select *
  from (
    values
      -- id, poster_idx, kind, role, department, production, location, pay_rate,
      -- start_date, end_date, deadline, engagement, details, created_offset, expires_offset
      (
        'a0000001-0000-4000-8000-000000000001'::uuid, 0, 'full'::public.job_kind,
        'Equipment Manager', 'Production',
        'Taylor Swift · Eras Tour',
        'Bakersfield, CA → Tampa, FL · all cities',
        '$2,400/wk + per diem',
        date '2026-08-05', date '2026-10-30', date '2026-08-20',
        'Touring'::public.engagement_type,
        'Detail-obsessed equipment manager needed for a full arena run. Each artist travels with their own rig — we need someone who lives in the truck pack and keeps every case tracked from load-in to load-out.',
        interval '20 minutes', null::interval
      ),
      (
        'a0000002-0000-4000-8000-000000000002'::uuid, 1, 'full'::public.job_kind,
        'Front of House Engineer', 'Audio',
        'Meridian · Afterglow World Tour',
        'Nationwide US · arena routing',
        '$3,200/wk',
        date '2026-09-12', date '2027-02-28', date '2026-08-20',
        'Touring'::public.engagement_type,
        'Seasoned FOH engineer for a 60+ date arena run. DiGiCo Quantum required, Waves rack a plus. You own the mix from soundcheck to encore.',
        interval '2 hours', null::interval
      ),
      (
        'a0000003-0000-4000-8000-000000000003'::uuid, 2, 'full'::public.job_kind,
        'Lighting Programmer', 'Lighting',
        'Sunfall Festival 2026',
        'Barcelona, ES · main stage',
        '€450/day',
        date '2026-08-18', date '2026-08-21', date '2026-08-01',
        'Festival'::public.engagement_type,
        'Fast-paced festival weekend with tight changeovers. MA3 programmer who can busk and pre-viz confidently. Multiple headliners per night.',
        interval '1 day', null::interval
      ),
      (
        'a0000004-0000-4000-8000-000000000004'::uuid, 3, 'full'::public.job_kind,
        'Video Engineer / EIC', 'Video',
        'Aurora · One Night Only',
        'Los Angeles, CA · The Forum',
        '$1,100/day',
        date '2026-08-29', date '2026-08-29', date '2026-08-10',
        'One-Off'::public.engagement_type,
        'Single-night broadcast capture for a livestream special. EIC to lead a small camera package and manage shading. Union call.',
        interval '3 days', null::interval
      ),
      (
        'a0000005-0000-4000-8000-000000000005'::uuid, 4, 'full'::public.job_kind,
        'Drum Tech', 'Backline',
        'The Hollows · Studio Sessions',
        'Nashville, TN · studio-based',
        '$500/day',
        date '2026-08-14', date '2026-08-22', date '2026-08-01',
        'Session'::public.engagement_type,
        'Two weeks of tracking sessions. Tuning, maintenance, and quick kit changes between takes. Vintage kit knowledge appreciated.',
        interval '5 days', null::interval
      ),
      (
        'a0000006-0000-4000-8000-000000000006'::uuid, 5, 'full'::public.job_kind,
        'Monitor Engineer', 'Audio',
        'Casino Royale · Vegas Residency',
        'Las Vegas, NV · resident venue',
        '$2,800/wk',
        date '2026-10-01', date '2027-04-30', date '2026-09-01',
        'Residency'::public.engagement_type,
        'Long-run residency with a stable show file. IEM-heavy stage, six-piece band plus tracks. Calm stage presence matters more than flash.',
        interval '7 days', null::interval
      ),
      (
        'a0000007-0000-4000-8000-000000000007'::uuid, 6, 'full'::public.job_kind,
        'Head Rigger', 'Rigging',
        'Voltage · Amphitheater Run',
        'West Coast US · sheds',
        '$2,600/wk',
        date '2026-08-20', date '2026-09-05', date '2026-08-05',
        'Touring'::public.engagement_type,
        'Ground-up rigging lead for a summer amphitheater run. ETCP certification required. Build points, manage local crews, keep load-in on schedule.',
        interval '8 days', null::interval
      ),
      (
        'a0000008-0000-4000-8000-000000000008'::uuid, 7, 'full'::public.job_kind,
        'Wardrobe Head', 'Wardrobe',
        'Nova · Iridescent Tour',
        'UK / Europe · theater routing',
        '£1,900/wk',
        date '2026-09-05', date '2026-12-18', date '2026-08-15',
        'Touring'::public.engagement_type,
        'Lead a two-person wardrobe department across a European theater run. Quick changes, laundry logistics, daily steaming. Couture handling preferred.',
        interval '14 days', null::interval
      ),
      (
        'a0000009-0000-4000-8000-000000000009'::uuid, 0, 'urgent'::public.job_kind,
        'A2 / Audio Tech', 'Audio',
        'Midwest Shed Run · emergency cover',
        'Chicago, IL · tonight load-in',
        '$450/day + per diem',
        date '2026-07-27', date '2026-07-28', null,
        'One-Off'::public.engagement_type,
        'Monitor tech fell ill — need an A2 who can jump on a PM5D and IEM pack immediately. Load-in 4pm today, show 8pm. Local or willing to drive.',
        interval '45 minutes', interval '36 hours'
      ),
      (
        'a000000a-0000-4000-8000-00000000000a'::uuid, 1, 'urgent'::public.job_kind,
        'RF Tech', 'Audio',
        'Festival Main Stage · RF emergency',
        'Austin, TX · weekend',
        '$400/day',
        date '2026-07-28', date '2026-07-29', null,
        'Festival'::public.engagement_type,
        'Need RF tech ASAP for a last-minute festival slot. Shure Axient experience required. Coordination with broadcast compound.',
        interval '3 hours', interval '40 hours'
      )
  ) as v (
    id,
    poster_idx,
    kind,
    role,
    department,
    production,
    location,
    pay_rate,
    start_date,
    end_date,
    deadline,
    engagement,
    details,
    created_offset,
    expires_offset
  )
)
insert into public.job_postings (
  id,
  kind,
  status,
  poster_id,
  role,
  department,
  production,
  location,
  pay_rate,
  start_date,
  end_date,
  deadline,
  engagement,
  details,
  expires_at,
  created_at,
  updated_at
)
select
  s.id,
  s.kind,
  'open'::public.job_status,
  p.id,
  s.role,
  s.department,
  s.production,
  s.location,
  s.pay_rate,
  s.start_date,
  s.end_date,
  s.deadline,
  s.engagement,
  s.details,
  case
    when s.expires_offset is not null then now() + s.expires_offset
    else null
  end,
  now() - s.created_offset,
  now() - s.created_offset
from seed_jobs s
cross join poster_count pc
join posters p
  on p.idx = (s.poster_idx % greatest(pc.total, 1))
where pc.total > 0;

-- ---------------------------------------------------------------------------
-- Sample saved jobs (first active profile saves a few listings)
-- ---------------------------------------------------------------------------

with viewer as (
  select id
  from public.profiles
  where status = 'active'::public.user_status
  order by created_at, id
  limit 1
)
insert into public.saved_jobs (job_id, user_id)
select j.id, v.id
from viewer v
cross join (
  values
    ('a0000002-0000-4000-8000-000000000002'::uuid),
    ('a0000006-0000-4000-8000-000000000006'::uuid),
    ('a0000009-0000-4000-8000-000000000009'::uuid)
) as j(id)
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Sample applications (second active profile applies to two jobs)
-- ---------------------------------------------------------------------------

with applicant as (
  select id
  from public.profiles
  where status = 'active'::public.user_status
  order by created_at, id
  offset 1
  limit 1
),
poster as (
  select id
  from public.profiles
  where status = 'active'::public.user_status
  order by created_at, id
  limit 1
)
insert into public.job_applications (job_id, applicant_id, note, status)
select
  j.id,
  a.id,
  j.note,
  j.status::public.application_status
from applicant a
cross join (
  values
    (
      'a0000001-0000-4000-8000-000000000001'::uuid,
      'Available from Aug 1. Managed backline on two arena runs last year — happy to share credits.',
      'pending'
    ),
    (
      'a0000003-0000-4000-8000-000000000003'::uuid,
      'MA3 programmer based in Barcelona for the summer. Can start prep remotely this week.',
      'maybe'
    )
) as j(id, note, status)
where a.id is not null
  and a.id <> (select id from poster)
on conflict (job_id, applicant_id) do update
  set note = excluded.note,
      status = excluded.status,
      updated_at = now();

-- ---------------------------------------------------------------------------
-- Verify
-- ---------------------------------------------------------------------------

select
  kind,
  count(*) as count
from public.job_postings
where id = any(array[
  'a0000001-0000-4000-8000-000000000001'::uuid,
  'a0000002-0000-4000-8000-000000000002'::uuid,
  'a0000003-0000-4000-8000-000000000003'::uuid,
  'a0000004-0000-4000-8000-000000000004'::uuid,
  'a0000005-0000-4000-8000-000000000005'::uuid,
  'a0000006-0000-4000-8000-000000000006'::uuid,
  'a0000007-0000-4000-8000-000000000007'::uuid,
  'a0000008-0000-4000-8000-000000000008'::uuid,
  'a0000009-0000-4000-8000-000000000009'::uuid,
  'a000000a-0000-4000-8000-00000000000a'::uuid
])
group by kind
order by kind;

select
  j.role,
  j.kind,
  j.engagement,
  p.full_name as poster,
  j.created_at
from public.job_postings j
join public.profiles p on p.id = j.poster_id
where j.id = any(array[
  'a0000001-0000-4000-8000-000000000001'::uuid,
  'a0000002-0000-4000-8000-000000000002'::uuid,
  'a0000003-0000-4000-8000-000000000003'::uuid,
  'a0000004-0000-4000-8000-000000000004'::uuid,
  'a0000005-0000-4000-8000-000000000005'::uuid,
  'a0000006-0000-4000-8000-000000000006'::uuid,
  'a0000007-0000-4000-8000-000000000007'::uuid,
  'a0000008-0000-4000-8000-000000000008'::uuid,
  'a0000009-0000-4000-8000-000000000009'::uuid,
  'a000000a-0000-4000-8000-00000000000a'::uuid
])
order by j.created_at desc;

-- =============================================================================
