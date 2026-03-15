package ru.itmo.pindesk.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import ru.itmo.pindesk.entity.User;
import ru.itmo.pindesk.repo.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UsersController {

    private final UserRepository userRepository;

    public UsersController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> me(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof ru.itmo.pindesk.security.JwtService.JwtPayload payload)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userRepository.findById(payload.userId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return ResponseEntity.ok(new UserDto(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole().name()
        ));
    }

    /**
     * Получить всех пользователей (для общего чата)
     * Доступно всем авторизованным пользователям
     */
    @GetMapping("/all")
    public ResponseEntity<List<UserDto>> getAllUsers(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof ru.itmo.pindesk.security.JwtService.JwtPayload)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<UserDto> users = userRepository.findAll().stream()
                .map(user -> new UserDto(user.getId(), user.getEmail(), user.getName(), user.getRole().name()))
                .toList();
        return ResponseEntity.ok(users);
    }

    public record UserDto(Long id, String email, String name, String role) {}
}
