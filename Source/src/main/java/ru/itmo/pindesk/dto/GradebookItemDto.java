package ru.itmo.pindesk.dto;

import java.time.LocalDate;

public record GradebookItemDto(
        long itemId,
        String categoryTitle,
        String title,
        int points,
        int maxPoints,
        LocalDate dueDate,
        String status,
        int progressPercent
) {}