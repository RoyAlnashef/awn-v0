alter table public.profiles
  add column if not exists facebook text;

comment on column public.profiles.facebook is
  'Normalized Facebook username or profile path (no protocol).';

comment on column public.membership_applications.social_links is
  'JSON object with optional keys: linkedin, instagram, facebook, twitter, youtube, website.';
