package ru.itmo.pindesk.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey key;
    private final long ttlMinutes;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.ttlMinutes:120}") long ttlMinutes
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.ttlMinutes = ttlMinutes;
    }

    public String issueToken(long userId, String email, Role role) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(ttlMinutes * 60);

        return Jwts.builder()
                .subject(Long.toString(userId))
                .claim("email", email)
                .claim("role", role.name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .signWith(key)
                .compact();
    }

    public JwtPayload parse(String token) {
        var claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        long userId = Long.parseLong(claims.getSubject());
        String email = claims.get("email", String.class);
        Role role = Role.valueOf(claims.get("role", String.class));
        return new JwtPayload(userId, email, role);
    }

    public record JwtPayload(long userId, String email, Role role) {}
}