package ru.itmo.pindesk.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.pindesk.dto.auth.AuthDtos;
import ru.itmo.pindesk.entity.User;
import ru.itmo.pindesk.repo.UserRepository;
import ru.itmo.pindesk.security.JwtService;
import ru.itmo.pindesk.security.Role;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request) {
        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Email already in use");
        }

        User user = new User();
        user.setEmail(email);
        user.setName(request.name());
        user.setRole(Role.STUDENT);
        user.setPasswordHash(passwordEncoder.encode(request.password()));

        user = userRepository.save(user);

        String token = jwtService.issueToken(user.getId(), user.getEmail(), user.getRole());
        return new AuthDtos.AuthResponse(token);
    }

    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        String email = request.email().trim().toLowerCase();

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        String token = jwtService.issueToken(user.getId(), user.getEmail(), user.getRole());
        return new AuthDtos.AuthResponse(token);
    }
}