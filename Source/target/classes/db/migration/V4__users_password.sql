alter table users
  add column if not exists password_hash varchar(255);

update users
set password_hash = '$2a$10$gEwBrTQf1wR0Zk8q1S2o6eO1FQOqQvG5gqK4pQH1tG7Oq8QmYt8u6'
where id = 1 and password_hash is null;