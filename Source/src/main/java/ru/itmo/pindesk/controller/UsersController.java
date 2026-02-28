package ru.itmo.pindesk.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import ru.itmo.pindesk.dto.auth.AuthDtos.MeResponse;
import ru.itmo.pindesk.security.JwtService;

@RestController
@RequestMapping("/api/users")
public class UsersController {

    @GetMapping("/me")
    public MeResponse me(Authentication auth) {
        var payload = (JwtService.JwtPayload) auth.getPrincipal();


        return new MeResponse(
                payload.userId(),
                payload.email(),
                null,
                payload.role().name()
        );
    }
}