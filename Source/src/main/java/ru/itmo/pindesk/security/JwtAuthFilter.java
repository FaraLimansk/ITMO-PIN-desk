package ru.itmo.pindesk.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();

        // auth и swagger должны проходить без токена
        return path.startsWith("/api/auth/")
                || path.startsWith("/swagger-ui/")
                || path.equals("/swagger-ui.html")
                || path.startsWith("/v3/api-docs/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain
    ) throws ServletException, IOException {

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        logger.debug("Authorization header: " + (header != null ? "present" : "missing"));

        // Нет Bearer-токена -> просто пропускаем дальше
        if (header == null || !header.startsWith("Bearer ")) {
            logger.debug("No Bearer token found");
            chain.doFilter(request, response);
            return;
        }

        String token = header.substring("Bearer ".length()).trim();

        if (token.isEmpty()) {
            logger.debug("Empty token");
            chain.doFilter(request, response);
            return;
        }

        try {
            JwtService.JwtPayload payload = jwtService.parse(token);
            logger.debug("Parsed token for user: " + payload.email() + ", role: " + payload.role());

            var authorities = List.of(
                    new SimpleGrantedAuthority("ROLE_" + payload.role().name())
            );

            var auth = new UsernamePasswordAuthenticationToken(payload, null, authorities);
            SecurityContextHolder.getContext().setAuthentication(auth);
            logger.debug("Authentication set in SecurityContext");

        } catch (Exception e) {
            logger.error("Failed to parse token: " + e.getMessage());
            // Токен не валиден - пропускаем без аутентификации
            // Контроллер вернёт 401
        }

        chain.doFilter(request, response);
    }
}