package ru.itmo.pindesk.dto;

import java.util.List;

/**
 * Информация об оценках студента по предмету
 */
public record StudentGradeDto(
        Long studentId,
        String studentName,
        String studentEmail,
        List<GradeItemDto> grades
) {
    /**
     * Отдельная оценка за задание
     */
    public record GradeItemDto(
            Long itemId,
            String categoryTitle,
            String title,
            int points,
            int maxPoints,
            int progressPercent
    ) {}
}
