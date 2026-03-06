package ru.itmo.pindesk.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import ru.itmo.pindesk.dto.GradebookItemDto;
import ru.itmo.pindesk.dto.GradebookSummaryDto;
import ru.itmo.pindesk.security.JwtService;
import ru.itmo.pindesk.service.GradebookService;

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
}