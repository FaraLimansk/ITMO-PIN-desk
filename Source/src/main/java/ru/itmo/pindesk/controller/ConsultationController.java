package ru.itmo.pindesk.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import ru.itmo.pindesk.dto.ConsultationDtos.*;
import ru.itmo.pindesk.entity.ConsultationBooking;
import ru.itmo.pindesk.entity.ConsultationSlot;
import ru.itmo.pindesk.entity.User;
import ru.itmo.pindesk.repo.ConsultationBookingRepository;
import ru.itmo.pindesk.security.JwtService;
import ru.itmo.pindesk.service.ConsultationService;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/consultations")
public class ConsultationController {

    private final ConsultationService consultationService;
    private final ConsultationBookingRepository bookingRepository;
    private final JwtService jwtService;

    public ConsultationController(ConsultationService consultationService,
                                  ConsultationBookingRepository bookingRepository,
                                  JwtService jwtService) {
        this.consultationService = consultationService;
        this.bookingRepository = bookingRepository;
        this.jwtService = jwtService;
    }

    /**
     * Получить все доступные слоты для записи (для всех авторизованных)
     */
    @GetMapping
    public ResponseEntity<List<SlotResponse>> getAllSlots(
            @RequestParam(required = false) LocalDate from
    ) {
        LocalDate fromDate = from != null ? from : LocalDate.now();
        List<ConsultationSlot> slots = consultationService.getAvailableSlots(fromDate);

        List<SlotResponse> response = slots.stream().map(slot -> {
            long bookedCount = bookingRepository.countBySlotIdAndStatus(slot.getId(), ConsultationBooking.BookingStatus.CONFIRMED);
            return new SlotResponse(
                    slot.getId(),
                    slot.getTeacher().getId(),
                    slot.getTeacher().getName(),
                    slot.getDate(),
                    slot.getStartTime(),
                    slot.getEndTime(),
                    slot.getLocation(),
                    slot.getTopic(),
                    slot.getMaxStudents(),
                    slot.getCourseId(),
                    (int) bookedCount,
                    bookedCount < slot.getMaxStudents()
            );
        }).toList();

        return ResponseEntity.ok(response);
    }

    /**
     * Получить слоты конкретного преподавателя
     */
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<SlotResponse>> getTeacherSlots(@PathVariable Long teacherId) {
        List<ConsultationSlot> slots = consultationService.getTeacherSlots(teacherId);

        List<SlotResponse> response = slots.stream().map(slot -> {
            long bookedCount = bookingRepository.countBySlotIdAndStatus(slot.getId(), ConsultationBooking.BookingStatus.CONFIRMED);
            return new SlotResponse(
                    slot.getId(),
                    slot.getTeacher().getId(),
                    slot.getTeacher().getName(),
                    slot.getDate(),
                    slot.getStartTime(),
                    slot.getEndTime(),
                    slot.getLocation(),
                    slot.getTopic(),
                    slot.getMaxStudents(),
                    slot.getCourseId(),
                    (int) bookedCount,
                    bookedCount < slot.getMaxStudents()
            );
        }).toList();

        return ResponseEntity.ok(response);
    }

    /**
     * Создать слот консультации (только TEACHER/ADMIN)
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<SlotResponse> createSlot(
            @RequestBody CreateSlotRequest request,
            Authentication auth
    ) {
        User teacher = getCurrentUser(auth);

        ConsultationSlot slot = new ConsultationSlot();
        slot.setDate(request.date());
        slot.setStartTime(request.startTime());
        slot.setEndTime(request.endTime());
        slot.setLocation(request.location());
        slot.setTopic(request.topic());
        slot.setMaxStudents(request.maxStudents() != null ? request.maxStudents() : 1);
        slot.setCourseId(request.courseId());

        ConsultationSlot created = consultationService.createSlot(slot, teacher, request.courseId());

        return ResponseEntity.status(HttpStatus.CREATED).body(new SlotResponse(
                created.getId(),
                created.getTeacher().getId(),
                created.getTeacher().getName(),
                created.getDate(),
                created.getStartTime(),
                created.getEndTime(),
                created.getLocation(),
                created.getTopic(),
                created.getMaxStudents(),
                created.getCourseId(),
                0,
                true
        ));
    }

    /**
     * Обновить слот консультации (только автор слота)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<SlotResponse> updateSlot(
            @PathVariable Long id,
            @RequestBody UpdateSlotRequest request,
            Authentication auth
    ) {
        User teacher = getCurrentUser(auth);

        ConsultationSlot updatedSlot = new ConsultationSlot();
        updatedSlot.setDate(request.date());
        updatedSlot.setStartTime(request.startTime());
        updatedSlot.setEndTime(request.endTime());
        updatedSlot.setLocation(request.location());
        updatedSlot.setTopic(request.topic());
        updatedSlot.setMaxStudents(request.maxStudents() != null ? request.maxStudents() : 1);
        updatedSlot.setCourseId(request.courseId());

        ConsultationSlot updated = consultationService.updateSlot(id, updatedSlot, teacher, request.courseId());

        long bookedCount = bookingRepository.countBySlotIdAndStatus(updated.getId(), ConsultationBooking.BookingStatus.CONFIRMED);

        return ResponseEntity.ok(new SlotResponse(
                updated.getId(),
                updated.getTeacher().getId(),
                updated.getTeacher().getName(),
                updated.getDate(),
                updated.getStartTime(),
                updated.getEndTime(),
                updated.getLocation(),
                updated.getTopic(),
                updated.getMaxStudents(),
                updated.getCourseId(),
                (int) bookedCount,
                bookedCount < updated.getMaxStudents()
        ));
    }

    /**
     * Удалить слот консультации (только автор слота)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<?> deleteSlot(@PathVariable Long id, Authentication auth) {
        User teacher = getCurrentUser(auth);
        consultationService.deleteSlot(id, teacher);
        return ResponseEntity.ok(Map.of("message", "Slot deleted successfully"));
    }

    /**
     * Записаться на консультацию (для STUDENT)
     */
    @PostMapping("/{id}/book")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<BookSlotResponse> bookSlot(@PathVariable Long id, Authentication auth) {
        User student = getCurrentUser(auth);
        consultationService.bookSlot(id, student);
        return ResponseEntity.ok(new BookSlotResponse(id, id, "Successfully booked"));
    }

    /**
     * Отменить запись на консультацию
     */
    @DeleteMapping("/{id}/book")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id, Authentication auth) {
        User student = getCurrentUser(auth);
        consultationService.cancelBooking(id, student);
        return ResponseEntity.ok(Map.of("message", "Booking cancelled successfully"));
    }

    /**
     * Получить мои записи на консультации
     */
    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(Authentication auth) {
        User student = getCurrentUser(auth);
        List<ConsultationBooking> bookings = consultationService.getStudentBookings(student.getId());

        List<BookingResponse> response = bookings.stream().map(booking -> {
            ConsultationSlot slot = booking.getSlot();
            return new BookingResponse(
                    booking.getId(),
                    slot.getId(),
                    student.getId(),
                    student.getName(),
                    slot.getTeacher().getName(),
                    slot.getDate(),
                    slot.getStartTime(),
                    slot.getLocation(),
                    slot.getTopic(),
                    booking.getStatus().name()
            );
        }).toList();

        return ResponseEntity.ok(response);
    }

    /**
     * Получить записи на слоты преподавателя (только TEACHER/ADMIN)
     */
    @GetMapping("/teacher/bookings")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<List<BookingResponse>> getTeacherBookings(Authentication auth) {
        User teacher = getCurrentUser(auth);
        List<ConsultationBooking> bookings = consultationService.getTeacherBookings(teacher.getId());

        List<BookingResponse> response = bookings.stream().map(booking -> {
            ConsultationSlot slot = booking.getSlot();
            return new BookingResponse(
                    booking.getId(),
                    slot.getId(),
                    booking.getStudent().getId(),
                    booking.getStudent().getName(),
                    teacher.getName(),
                    slot.getDate(),
                    slot.getStartTime(),
                    slot.getLocation(),
                    slot.getTopic(),
                    booking.getStatus().name()
            );
        }).toList();

        return ResponseEntity.ok(response);
    }

    /**
     * Отменить запись студента (только преподаватель)
     */
    @PostMapping("/bookings/{bookingId}/cancel")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<?> cancelBookingByTeacher(@PathVariable Long bookingId, Authentication auth) {
        User teacher = getCurrentUser(auth);
        consultationService.cancelBookingByTeacher(bookingId, teacher);
        return ResponseEntity.ok(Map.of("message", "Booking cancelled by teacher"));
    }

    private User getCurrentUser(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof JwtService.JwtPayload payload)) {
            throw new IllegalArgumentException("Unauthorized");
        }
        // Извлекаем userId из токена
        return new User(payload.userId(), payload.email(), payload.name(), payload.role(), null);
    }
}
