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
    public List<Course> available(Authentication authentication) {
        JwtService.JwtPayload payload = (JwtService.JwtPayload) authentication.getPrincipal();
        List<Long> enrolledIds = enrollmentRepository.findByUserId(payload.userId())
                .stream()
                .map(Enrollment::getCourseId)
                .toList();
        return courseRepository.findAll().stream()
                .filter(c -> !enrolledIds.contains(c.getId()))
                .toList();
    }

    @PostMapping("/{courseId}/enroll")
    public ResponseEntity<?> enroll(@PathVariable Long courseId, Authentication authentication) {
        JwtService.JwtPayload payload = (JwtService.JwtPayload) authentication.getPrincipal();
        long userId = payload.userId();

        if (enrollmentRepository.existsByUserIdAndCourseId(userId, courseId)) {
            return ResponseEntity.badRequest().body("Already enrolled");
        }

        enrollmentRepository.save(new Enrollment(userId, courseId));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/my")
    public List<Course> myCourses(Authentication authentication) {
        JwtService.JwtPayload payload = (JwtService.JwtPayload) authentication.getPrincipal();
        List<Long> enrolledIds = enrollmentRepository.findByUserId(payload.userId())
                .stream()
                .map(Enrollment::getCourseId)
                .toList();
        return courseRepository.findAll().stream()
                .filter(c -> enrolledIds.contains(c.getId()))
                .toList();
    }
}