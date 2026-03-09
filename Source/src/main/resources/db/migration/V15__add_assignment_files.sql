-- Таблица для файлов лабораторных работ
CREATE TABLE assignment_files (
    id BIGSERIAL PRIMARY KEY,
    item_id BIGINT NOT NULL REFERENCES assessment_items(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    file_data BYTEA NOT NULL,
    uploaded_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    uploaded_by BIGINT REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_assignment_files_item_id ON assignment_files(item_id);
