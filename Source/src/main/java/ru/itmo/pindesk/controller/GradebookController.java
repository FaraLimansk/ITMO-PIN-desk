package ru.itmo.pindesk.controller;

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
    public GradebookSummaryDto summary(
            @RequestParam long courseId,
            Authentication authentication
    ) {
        JwtService.JwtPayload payload = (JwtService.JwtPayload) authentication.getPrincipal();
        long userId = payload.userId();
        return gradebookService.summary(courseId, userId);
    }

    @GetMapping("/items")
    public List<GradebookItemDto> items(
            @RequestParam long courseId,
            Authentication authentication
    ) {
        JwtService.JwtPayload payload = (JwtService.JwtPayload) authentication.getPrincipal();
        long userId = payload.userId();
        return gradebookService.items(courseId, userId);
    }
}