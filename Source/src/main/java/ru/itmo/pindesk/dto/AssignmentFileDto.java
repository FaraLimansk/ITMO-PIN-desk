package ru.itmo.pindesk.dto;

import java.time.LocalDateTime;

public record AssignmentFileDto(
        Long id,
        Long itemId,
        String fileName,
        String fileType,
        Long fileSize,
        LocalDateTime uploadedAt,
        String uploadedByName
) {}
