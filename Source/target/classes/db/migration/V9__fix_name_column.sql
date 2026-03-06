-- Удаляем дублирующую колонку name (если есть)
-- и переименовываем full_name в name
ALTER TABLE users DROP COLUMN IF EXISTS name;
ALTER TABLE users RENAME COLUMN full_name TO name;
