package ru.itmo.pindesk.dto;

import java.util.List;

public record GradebookSummaryDto(
        long courseId,
        long userId,
        int totalPoints,
        int maxPoints,
        List<CategorySummary> categories
) {
    public record CategorySummary(
            long categoryId,
            String title,
            int earnedPoints,
            int maxPoints
    ) {}
}