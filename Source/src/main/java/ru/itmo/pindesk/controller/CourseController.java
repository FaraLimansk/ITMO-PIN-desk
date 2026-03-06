package ru.itmo.pindesk.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import ru.itmo.pindesk.entity.Course;
import ru.itmo.pindesk.entity.Enrollment;
import ru.itmo.pindesk.repo.CourseRepository;
import ru.itmo.pindesk.repo.EnrollmentRepository;
import ru.itmo.pindesk.security.JwtService;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final JwtService jwtService;

    public CourseController(CourseRepository courseRepository, EnrollmentRepository enrollmentRepository, JwtService jwtService) {
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.jwtService = jwtService;
    }

    @GetMapping
    public List<Course> list() {
        return courseRepository.findAll();
    }

    @PostMapping
    public Course create(@RequestBody Course course) {
        return courseRepository.save(course);
    }

    @GetMapping("/available")
    public ResponseEntity<List<Course>> available(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof JwtService.JwtPayload payload)) {
            return ResponseEntity.status(401).build();
        }
        
        List<Long> enrolledIds = enrollmentRepository.findByUserId(payload.userId())
                .stream()
                .map(Enrollment::getCourseId)
                .toList();
        return ResponseEntity.ok(courseRepository.findAll().stream()
                .filter(c -> !enrolledIds.contains(c.getId()))
                .toList());
    }

    @PostMapping("/{courseId}/enroll")
    public ResponseEntity<?> enroll(@PathVariable Long courseId, Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof JwtService.JwtPayload payload)) {
            return ResponseEntity.status(401).build();
        }

        if (enrollmentRepository.existsByUserIdAndCourseId(payload.userId(), courseId)) {
            return ResponseEntity.badRequest().body("Already enrolled");
        }

        enrollmentRepository.save(new Enrollment(payload.userId(), courseId));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/my")
    public ResponseEntity<List<Course>> myCourses(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof JwtService.JwtPayload payload)) {
            return ResponseEntity.status(401).build();
        }
        
        List<Long> enrolledIds = enrollmentRepository.findByUserId(payload.userId())
                .stream()
                .map(Enrollment::getCourseId)
                .toList();
        return ResponseEntity.ok(courseRepository.findAll().stream()
                .filter(c -> enrolledIds.contains(c.getId()))
                .toList());
    }
}