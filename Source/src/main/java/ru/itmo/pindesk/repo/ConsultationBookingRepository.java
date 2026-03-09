package ru.itmo.pindesk.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.itmo.pindesk.entity.ConsultationBooking;
import ru.itmo.pindesk.entity.ConsultationSlot;
import ru.itmo.pindesk.entity.User;

import java.util.List;
import java.util.Optional;

public interface ConsultationBookingRepository extends JpaRepository<ConsultationBooking, Long> {

    Optional<ConsultationBooking> findBySlotIdAndStudentId(Long slotId, Long studentId);

    List<ConsultationBooking> findByStudentId(Long studentId);

    List<ConsultationBooking> findBySlotId(Long slotId);

    @Query("SELECT cb FROM ConsultationBooking cb WHERE cb.student.id = :studentId AND cb.status = 'CONFIRMED'")
    List<ConsultationBooking> findActiveBookingsByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT cb FROM ConsultationBooking cb WHERE cb.slot.teacher.id = :teacherId AND cb.status = 'CONFIRMED'")
    List<ConsultationBooking> findBookingsByTeacherId(@Param("teacherId") Long teacherId);

    long countBySlotIdAndStatus(Long slotId, ConsultationBooking.BookingStatus status);
}
