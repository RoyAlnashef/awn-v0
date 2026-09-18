-- Public crew profile handles: /crew/[handle]

alter table public.profiles
  add column if not exists handle text;

comment on column public.profiles.handle is
  'URL slug for public crew profile at /crew/[handle]. Auto-generated from name; editable later.';

create unique index if not exists profiles_handle_lower_unique
  on public.profiles (lower(handle))
  where handle is not null;

create or replace function public.slugify_profile_handle(input text)
returns text
language plpgsql
immutable
as $$
declare
  result text;
begin
  result := lower(trim(coalesce(input, '')));
  result := regexp_replace(result, '[^a-z0-9]+', '-', 'g');
  result := regexp_replace(result, '-+', '-', 'g');
  result := trim(both '-' from result);

  if length(result) < 3 then
    result := 'member';
  end if;

  if length(result) > 40 then
    result := left(result, 40);
    result := trim(both '-' from result);
  end if;

  return result;
end;
$$;

do $$
declare
  r record;
  base_handle text;
  candidate text;
  suffix int;
begin
  for r in
    select id, full_name, email
    from public.profiles
    where handle is null
    order by created_at
  loop
    base_handle := public.slugify_profile_handle(
      coalesce(nullif(trim(r.full_name), ''), split_part(r.email, '@', 1))
    );
    candidate := base_handle;
    suffix := 2;

    while exists (
      select 1 from public.profiles p where lower(p.handle) = lower(candidate)
    ) loop
      candidate := base_handle || '-' || suffix::text;
      suffix := suffix + 1;
    end loop;

    update public.profiles set handle = candidate where id = r.id;
  end loop;
end;
$$;
