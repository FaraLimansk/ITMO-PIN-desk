package ru.itmo.pindesk.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.pindesk.entity.ConsultationBooking;
import ru.itmo.pindesk.entity.ConsultationSlot;
import ru.itmo.pindesk.entity.User;
import ru.itmo.pindesk.repo.ConsultationBookingRepository;
import ru.itmo.pindesk.repo.ConsultationSlotRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ConsultationService {

    private final ConsultationSlotRepository slotRepository;
    private final ConsultationBookingRepository bookingRepository;

    public ConsultationService(ConsultationSlotRepository slotRepository,
                               ConsultationBookingRepository bookingRepository) {
        this.slotRepository = slotRepository;
        this.bookingRepository = bookingRepository;
    }

    /**
     * Получить все доступные слоты для записи (сегодня и в будущем)
     */
    public List<ConsultationSlot> getAvailableSlots(LocalDate from) {
        return slotRepository.findAvailableSlots(from);
    }

    /**
     * Получить все слоты преподавателя
     */
    public List<ConsultationSlot> getTeacherSlots(Long teacherId) {
        return slotRepository.findByTeacherId(teacherId);
    }

    /**
     * Создать слот консультации (только преподаватель)
     */
    @Transactional
    public ConsultationSlot createSlot(ConsultationSlot slot, User teacher) {
        if (teacher == null) {
            throw new IllegalArgumentException("Teacher must be provided");
        }
        slot.setTeacher(teacher);
        return slotRepository.save(slot);
    }

    /**
     * Обновить слот консультации
     */
    @Transactional
    public ConsultationSlot updateSlot(Long slotId, ConsultationSlot updatedSlot, User teacher) {
        ConsultationSlot existing = slotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Slot not found"));

        if (!existing.getTeacher().getId().equals(teacher.getId())) {
            throw new IllegalArgumentException("Only the teacher who created the slot can update it");
        }

        existing.setDate(updatedSlot.getDate());
        existing.setStartTime(updatedSlot.getStartTime());
        existing.setEndTime(updatedSlot.getEndTime());
        existing.setLocation(updatedSlot.getLocation());
        existing.setTopic(updatedSlot.getTopic());
        existing.setMaxStudents(updatedSlot.getMaxStudents());

        return slotRepository.save(existing);
    }

    /**
     * Удалить слот консультации
     */
    @Transactional
    public void deleteSlot(Long slotId, User teacher) {
        ConsultationSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Slot not found"));

        if (!slot.getTeacher().getId().equals(teacher.getId())) {
            throw new IllegalArgumentException("Only the teacher who created the slot can delete it");
        }

        slotRepository.delete(slot);
    }

    /**
     * Записаться на консультацию
     */
    @Transactional
    public ConsultationBooking bookSlot(Long slotId, User student) {
        ConsultationSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Slot not found"));

        // Проверка: уже записан?
        if (bookingRepository.findBySlotIdAndStudentId(slotId, student.getId()).isPresent()) {
            throw new IllegalArgumentException("You are already booked for this slot");
        }

        // Проверка: есть ли места
        long bookedCount = bookingRepository.countBySlotIdAndStatus(slotId, ConsultationBooking.BookingStatus.CONFIRMED);
        if (bookedCount >= slot.getMaxStudents()) {
            throw new IllegalArgumentException("No available seats in this slot");
        }

        ConsultationBooking booking = new ConsultationBooking();
        booking.setSlot(slot);
        booking.setStudent(student);
        booking.setBookedAt(LocalDateTime.now());
        booking.setStatus(ConsultationBooking.BookingStatus.CONFIRMED);

        return bookingRepository.save(booking);
    }

    /**
     * Отменить запись на консультацию
     */
    @Transactional
    public void cancelBooking(Long slotId, User student) {
        ConsultationBooking booking = bookingRepository.findBySlotIdAndStudentId(slotId, student.getId())
                .orElseThrow(() -> new IllegalArgumentException("You are not booked for this slot"));

        booking.setStatus(ConsultationBooking.BookingStatus.CANCELLED_BY_STUDENT);
        bookingRepository.save(booking);
    }

    /**
     * Получить все активные записи студента
     */
    public List<ConsultationBooking> getStudentBookings(Long studentId) {
        return bookingRepository.findActiveBookingsByStudentId(studentId);
    }

    /**
     * Получить все записи на слоты преподавателя
     */
    public List<ConsultationBooking> getTeacherBookings(Long teacherId) {
        return bookingRepository.findBookingsByTeacherId(teacherId);
    }

    /**
     * Отменить запись студента (преподавателем)
     */
    @Transactional
    public void cancelBookingByTeacher(Long bookingId, User teacher) {
        ConsultationBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (!booking.getSlot().getTeacher().getId().equals(teacher.getId())) {
            throw new IllegalArgumentException("Only the teacher of this slot can cancel the booking");
        }

        booking.setStatus(ConsultationBooking.BookingStatus.CANCELLED_BY_TEACHER);
        bookingRepository.save(booking);
    }
}
