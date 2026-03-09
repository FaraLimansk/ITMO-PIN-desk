package ru.itmo.pindesk.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .httpBasic(b -> b.disable())
                .formLogin(f -> f.disable())
                .logout(l -> l.disable())

                .authorizeHttpRequests(auth -> auth
                        // Публичные endpoints
                        .requestMatchers("/api/auth/**", "/api/health").permitAll()
                        // Swagger / OpenAPI
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-resources/**").permitAll()

                        // Публичный GET для курсов (доступен всем)
                        .requestMatchers(HttpMethod.GET, "/api/courses").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/courses/my").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/courses/available").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/courses/teaching").authenticated()

                        // Только для ADMIN
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Только для TEACHER и ADMIN (создание консультаций, курсов)
                        .requestMatchers(HttpMethod.POST, "/api/consultations/**").hasAnyRole("TEACHER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/consultations/**").hasAnyRole("TEACHER", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/consultations/**").hasAnyRole("TEACHER", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/courses").hasAnyRole("TEACHER", "ADMIN")

                        // Студенты могут записываться на курсы
                        .requestMatchers(HttpMethod.POST, "/api/courses/*/enroll").authenticated()

                        // Аутентифицированные пользователи
                        .requestMatchers("/api/users/me", "/api/gradebook/summary", "/api/gradebook/items").authenticated()

                        // Преподаватели могут создавать задания и загружать файлы
                        .requestMatchers(HttpMethod.POST, "/api/gradebook/items").hasAnyRole("TEACHER", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/gradebook/items/**/files").hasAnyRole("TEACHER", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/gradebook/files/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/gradebook/files/**").hasAnyRole("TEACHER", "ADMIN")

                        // Всё остальное — требуется аутентификация
                        .anyRequest().authenticated()
                )

                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration cfg) throws Exception {
        return cfg.getAuthenticationManager();
    }
}