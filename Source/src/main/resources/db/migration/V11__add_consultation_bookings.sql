-- Таблица записей на консультации
CREATE TABLE consultation_bookings (
    id BIGSERIAL PRIMARY KEY,
    slot_id BIGINT NOT NULL REFERENCES consultation_slots(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    booked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED',
    CONSTRAINT unique_student_slot UNIQUE (slot_id, student_id),
    CONSTRAINT chk_status CHECK (status IN ('CONFIRMED', 'CANCELLED_BY_STUDENT', 'CANCELLED_BY_TEACHER'))
);

-- Индексы для производительности
CREATE INDEX idx_consultation_bookings_slot ON consultation_bookings(slot_id);
CREATE INDEX idx_consultation_bookings_student ON consultation_bookings(student_id);
CREATE INDEX idx_consultation_bookings_status ON consultation_bookings(status);
