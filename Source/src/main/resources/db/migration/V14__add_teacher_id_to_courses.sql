-- Добавляем поле teacher_id в таблицу courses
ALTER TABLE courses ADD COLUMN teacher_id BIGINT;

-- Добавляем внешний ключ на таблицу users
ALTER TABLE courses ADD CONSTRAINT fk_courses_teacher
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL;

-- Индекс для быстрого поиска курсов преподавателя
CREATE INDEX idx_courses_teacher_id ON courses(teacher_id);
