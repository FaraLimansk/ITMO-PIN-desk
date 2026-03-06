alter table users
  alter column full_name drop not null;

update users
set full_name = coalesce(full_name, name, 'unknown')
where full_name is null;