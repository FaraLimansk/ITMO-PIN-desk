-- Fix users_id_seq to be greater than max existing id
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 0) + 1, false);
