package ru.itmo.pindesk.dto;

import java.time.LocalDateTime;

public class ChatDtos {

    public record MessageResponse(
            Long id,
            Long senderId,
            String senderName,
            String senderRole,
            String text,
            LocalDateTime createdAt,
            Boolean edited
    ) {}

    public record SendMessageRequest(
            String text
    ) {}
}
