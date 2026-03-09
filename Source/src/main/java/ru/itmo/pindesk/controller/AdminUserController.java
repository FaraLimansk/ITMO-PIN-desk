package ru.itmo.pindesk.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.itmo.pindesk.entity.User;
import ru.itmo.pindesk.repo.UserRepository;
import ru.itmo.pindesk.security.Role;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminUserController {

    private final UserRepository userRepository;

    public AdminUserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Получить всех пользователей (только ADMIN)
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> users = userRepository.findAll().stream()
                .map(user -> new UserDto(user.getId(), user.getEmail(), user.getName(), user.getRole().name()))
                .toList();
        return ResponseEntity.ok(users);
    }

    /**
     * Назначить роль пользователю (только ADMIN)
     */
    @PostMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> setUserRole(
            @PathVariable Long id,
            @RequestParam String role
    ) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Role targetRole;
        try {
            targetRole = Role.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid role. Valid values: STUDENT, TEACHER, ADMIN"));
        }

        user.setRole(targetRole);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Role updated successfully",
                "userId", user.getId(),
                "newRole", user.getRole().name()
        ));
    }

    /**
     * Простой DTO для ответа
     */
    public record UserDto(Long id, String email, String name, String role) {}
}
