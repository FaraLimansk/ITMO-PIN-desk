package ru.itmo.pindesk.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.itmo.pindesk.entity.Enrollment;

import java.util.List;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByUserId(Long userId);
    boolean existsByUserIdAndCourseId(Long userId, Long courseId);
}
