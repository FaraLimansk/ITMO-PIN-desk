-- Тестовый преподаватель (пароль: teacher123)
INSERT INTO users (email, name, role, password_hash)
VALUES (
    'teacher@itmo.ru',
    'Петр Преподаватель',
    'TEACHER',
    '$2a$10$Nyutlmg50kfNq1RUX5wnwuzLUT375VvsevX8ZRohx6LIZLnCdmcB2'
)
ON CONFLICT DO NOTHING;

-- Тестовый админ (пароль: admin123)
INSERT INTO users (email, name, role, password_hash)
VALUES (
    'admin@itmo.ru',
    'Админ Админов',
    'ADMIN',
    '$2a$10$Nyutlmg50kfNq1RUX5wnwuzLUT375VvsevX8ZRohx6LIZLnCdmcB2'
)
ON CONFLICT DO NOTHING;
