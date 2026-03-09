-- Тестовый студент (пароль: test123)
-- Хеш сгенерирован через BCrypt
INSERT INTO users (email, name, role, password_hash)
VALUES (
    'test@student.com',
    'Тест Студент',
    'STUDENT',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
)
ON CONFLICT (email) DO UPDATE SET role = 'STUDENT';

-- Тестовый преподаватель (пароль: test123)
INSERT INTO users (email, name, role, password_hash)
VALUES (
    'test@teacher.com',
    'Тест Преподаватель',
    'TEACHER',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
)
ON CONFLICT (email) DO UPDATE SET role = 'TEACHER';
