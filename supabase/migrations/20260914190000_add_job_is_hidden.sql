ALTER TABLE public.job_postings
  ADD COLUMN is_hidden boolean NOT NULL DEFAULT false;
