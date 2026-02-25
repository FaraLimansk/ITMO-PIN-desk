package ru.itmo.pindesk.controller;

import org.springframework.web.bind.annotation.*;
import ru.itmo.pindesk.entity.Course;
import ru.itmo.pindesk.repo.CourseRepository;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseRepository courseRepository;

    public CourseController(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    @GetMapping
    public List<Course> list() {
        return courseRepository.findAll();
    }

    @PostMapping
    public Course create(@RequestBody Course course) {
        return courseRepository.save(course);
    }
}