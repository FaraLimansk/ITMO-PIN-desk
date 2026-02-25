create table courses (
  id bigserial primary key,
  title varchar(255) not null,
  term varchar(32) not null
);