package ru.itmo.pindesk.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class ConsultationDtos {

    public record CreateSlotRequest(
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime,
            String location,
            String topic,
            Integer maxStudents
    ) {}

    public record UpdateSlotRequest(
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime,
            String location,
            String topic,
            Integer maxStudents
    ) {}

    public record SlotResponse(
            Long id,
            Long teacherId,
            String teacherName,
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime,
            String location,
            String topic,
            Integer maxStudents,
            Integer bookedCount,
            Boolean isAvailable
    ) {}

    public record BookingResponse(
            Long id,
            Long slotId,
            Long studentId,
            String studentName,
            String teacherName,
            LocalDate date,
            LocalTime startTime,
            String location,
            String topic,
            String status
    ) {}

    public record BookSlotResponse(
            Long bookingId,
            Long slotId,
            String message
    ) {}
}
