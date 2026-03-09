-- Тестовый преподаватель (пароль: teacher123)
INSERT INTO users (email, name, role, password_hash)
VALUES (
    'teacher@itmo.ru',
    'Петр Преподаватель',
    'TEACHER',
    '$2a$10$YgW3K7QoqM7.cYq8qF7Z5.8xVxKJ9kPqL7mN8oP9qR0sT1uV2wX3y'
)
ON CONFLICT DO NOTHING;

-- Тестовый админ (пароль: admin123)
INSERT INTO users (email, name, role, password_hash)
VALUES (
    'admin@itmo.ru',
    'Админ Админов',
    'ADMIN',
    '$2a$10$ZgX4L8RprN8.dZr9rG8A6.9yWyLK0lQrM8nO9pQ0rS1tU2vW3xY4z'
)
ON CONFLICT DO NOTHING;
