alter table users
  add column if not exists password_hash varchar(255);

update users
set password_hash = '$2a$10$MoY0Y.ef/uLbXr0rQdXT7.j3ZVWfBY3znKHTdgJBiPA2Nn2v59dqq'
where id = 1 and password_hash is null;