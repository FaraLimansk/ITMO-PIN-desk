alter table users
  add column if not exists name varchar(100);

update users
set name = 'unknown'
where name is null;

alter table users
  alter column name set not null;