package ru.itmo.pindesk.dto;

public record GradeRequest(
        Long studentId,
        Integer points
) {}
