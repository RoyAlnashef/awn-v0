-- Track how many times a job listing has been shared (DM + group messages combined).
alter table public.job_postings
  add column if not exists share_count integer not null default 0;

create or replace function public.bump_job_share_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.job_id is not null then
    update public.job_postings
    set share_count = share_count + 1
    where id = new.job_id;
  end if;

  return new;
end;
$$;

drop trigger if exists dm_messages_bump_job_share_count on public.dm_messages;

create trigger dm_messages_bump_job_share_count
  after insert on public.dm_messages
  for each row
  execute function public.bump_job_share_count();

drop trigger if exists room_messages_bump_job_share_count on public.room_messages;

create trigger room_messages_bump_job_share_count
  after insert on public.room_messages
  for each row
  execute function public.bump_job_share_count();

update public.job_postings j
set share_count = (
  (select count(*) from public.dm_messages d where d.job_id = j.id)
  + (select count(*) from public.room_messages r where r.job_id = j.id)
);
