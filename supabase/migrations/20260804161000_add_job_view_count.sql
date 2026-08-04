-- Track how many times a job listing has been viewed (excludes poster self-views in API).
alter table job_postings
  add column if not exists view_count integer not null default 0;
