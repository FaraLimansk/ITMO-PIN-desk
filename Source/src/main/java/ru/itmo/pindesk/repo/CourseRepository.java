package ru.itmo.pindesk.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.itmo.pindesk.entity.Course;

public interface CourseRepository extends JpaRepository<Course, Long> {
}