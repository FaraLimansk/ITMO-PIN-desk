package ru.itmo.pindesk.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Запись студента на консультацию
 */
@Entity
@Table(name = "consultation_bookings", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"slot_id", "student_id"})
})
public class ConsultationBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slot_id", nullable = false)
    private ConsultationSlot slot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(name = "booked_at", nullable = false)
    private LocalDateTime bookedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status = BookingStatus.CONFIRMED;

    public ConsultationBooking() {}

    public ConsultationBooking(Long id, ConsultationSlot slot, User student, LocalDateTime bookedAt, BookingStatus status) {
        this.id = id;
        this.slot = slot;
        this.student = student;
        this.bookedAt = bookedAt;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ConsultationSlot getSlot() { return slot; }
    public void setSlot(ConsultationSlot slot) { this.slot = slot; }

    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }

    public LocalDateTime getBookedAt() { return bookedAt; }
    public void setBookedAt(LocalDateTime bookedAt) { this.bookedAt = bookedAt; }

    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }

    public enum BookingStatus {
        CONFIRMED,
        CANCELLED_BY_STUDENT,
        CANCELLED_BY_TEACHER
    }
}
