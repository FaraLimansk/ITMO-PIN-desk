package ru.itmo.pindesk.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.itmo.pindesk.entity.ConsultationSlot;

import java.time.LocalDate;
import java.util.List;

public interface ConsultationSlotRepository extends JpaRepository<ConsultationSlot, Long> {

    List<ConsultationSlot> findByTeacherId(Long teacherId);

    List<ConsultationSlot> findByDate(LocalDate date);

    @Query("SELECT cs FROM ConsultationSlot cs WHERE cs.date >= :fromDate ORDER BY cs.date, cs.startTime")
    List<ConsultationSlot> findByDateFrom(@Param("fromDate") LocalDate fromDate);

    @Query("SELECT cs FROM ConsultationSlot cs " +
           "LEFT JOIN ConsultationBooking cb ON cs.id = cb.slot.id AND cb.status = 'CONFIRMED' " +
           "WHERE cs.date >= :fromDate " +
           "GROUP BY cs.id " +
           "HAVING COUNT(cb.id) < cs.maxStudents")
    List<ConsultationSlot> findAvailableSlots(@Param("fromDate") LocalDate fromDate);
}
