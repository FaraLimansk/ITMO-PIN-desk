package ru.itmo.pindesk.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ru.itmo.pindesk.dto.AssignmentFileDto;
import ru.itmo.pindesk.dto.GradeRequest;
import ru.itmo.pindesk.dto.GradebookItemDto;
import ru.itmo.pindesk.dto.GradebookSummaryDto;
import ru.itmo.pindesk.dto.StudentGradeDto;
import ru.itmo.pindesk.security.JwtService;
import ru.itmo.pindesk.service.GradebookService;

import java.time.LocalDate;
import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/gradebook")
public class GradebookController {

    private final GradebookService gradebookService;

    public GradebookController(GradebookService gradebookService) {
        this.gradebookService = gradebookService;
    }

    @GetMapping("/summary")
    public ResponseEntity<GradebookSummaryDto> summary(
            @RequestParam long courseId,
            Authentication authentication
    ) {
        if (authentication == null || !(authentication.getPrincipal() instanceof JwtService.JwtPayload payload)) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(gradebookService.summary(courseId, payload.userId()));
    }

    @GetMapping("/items")
    public ResponseEntity<List<GradebookItemDto>> items(
            @RequestParam long courseId,
            Authentication authentication
    ) {
        if (authentication == null || !(authentication.getPrincipal() instanceof JwtService.JwtPayload payload)) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(gradebookService.items(courseId, payload.userId()));
    }

    @PostMapping("/items")
    public ResponseEntity<GradebookItemDto> createItem(
            @RequestParam long courseId,
            @RequestParam String categoryTitle,
            @RequestParam String title,
            @RequestParam int maxPoints,
            @RequestParam(required = false) LocalDate dueDate,
            Authentication authentication
    ) {
        if (authentication == null || !(authentication.getPrincipal() instanceof JwtService.JwtPayload payload)) {
            return ResponseEntity.status(401).build();
        }
        GradebookItemDto item = gradebookService.createItem(courseId, categoryTitle, title, maxPoints, dueDate, payload.userId());
        return ResponseEntity.ok(item);
    }

    @PostMapping("/items/{itemId}/files")
    public ResponseEntity<AssignmentFileDto> uploadFile(
            @PathVariable long itemId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) {
        if (authentication == null || !(authentication.getPrincipal() instanceof JwtService.JwtPayload payload)) {
            return ResponseEntity.status(401).build();
        }

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        AssignmentFileDto savedFile = gradebookService.uploadFile(itemId, file, payload.userId());
        return ResponseEntity.ok(savedFile);
    }

    @GetMapping("/files/{fileId}")
    public ResponseEntity<byte[]> downloadFile(
            @PathVariable long fileId,
            Authentication authentication
    ) {
        if (authentication == null || !(authentication.getPrincipal() instanceof JwtService.JwtPayload payload)) {
            return ResponseEntity.status(401).build();
        }

        byte[] fileData = gradebookService.getFileData(fileId, payload.userId());
        String fileName = gradebookService.getFileName(fileId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(fileData);
    }

    @DeleteMapping("/files/{fileId}")
    public ResponseEntity<Void> deleteFile(
            @PathVariable long fileId,
            Authentication authentication
    ) {
        if (authentication == null || !(authentication.getPrincipal() instanceof JwtService.JwtPayload payload)) {
            return ResponseEntity.status(401).build();
        }

        gradebookService.deleteFile(fileId, payload.userId());
        return ResponseEntity.ok().build();
    }

    /**
     * Получить всех студентов с оценками по предмету
     * Доступно только преподавателю, ведущему этот курс
     */
    @GetMapping("/students")
    public ResponseEntity<List<StudentGradeDto>> getAllStudentGrades(
            @RequestParam long courseId,
            Authentication authentication
    ) {
        if (authentication == null || !(authentication.getPrincipal() instanceof JwtService.JwtPayload payload)) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(gradebookService.getAllStudentGrades(courseId, payload.userId()));
    }

    /**
     * Установить оценку студенту за задание
     * Доступно только преподавателю, ведущему этот курс
     */
    @PostMapping("/items/{itemId}/grades")
    public ResponseEntity<Void> setGrade(
            @PathVariable long itemId,
            @RequestBody GradeRequest request,
            Authentication authentication
    ) {
        if (authentication == null || !(authentication.getPrincipal() instanceof JwtService.JwtPayload payload)) {
            return ResponseEntity.status(401).build();
        }
        gradebookService.setGrade(itemId, request.studentId(), request.points(), payload.userId());
        return ResponseEntity.ok().build();
    }
}