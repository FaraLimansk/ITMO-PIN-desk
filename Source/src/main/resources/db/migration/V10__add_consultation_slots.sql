-- Таблица слотов консультаций
CREATE TABLE consultation_slots (
    id BIGSERIAL PRIMARY KEY,
    teacher_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    topic VARCHAR(500) NOT NULL,
    max_students INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT chk_time_order CHECK (end_time > start_time),
    CONSTRAINT chk_max_students CHECK (max_students > 0)
);

-- Индексы для производительности
CREATE INDEX idx_consultation_slots_teacher ON consultation_slots(teacher_id);
CREATE INDEX idx_consultation_slots_date ON consultation_slots(date);
CREATE INDEX idx_consultation_slots_date_time ON consultation_slots(date, start_time);
