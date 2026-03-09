package ru.itmo.pindesk.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.itmo.pindesk.entity.Course;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByTeacherId(Long teacherId);
}