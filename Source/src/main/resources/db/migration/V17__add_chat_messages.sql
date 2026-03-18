-- Таблица для сообщений общего чата
CREATE TABLE chat_messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited BOOLEAN DEFAULT FALSE
);

-- Индекс для быстрой выборки последних сообщений
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
