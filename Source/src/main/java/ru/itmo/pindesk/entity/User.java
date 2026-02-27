package ru.itmo.pindesk.entity;

import jakarta.persistence.*;
import ru.itmo.pindesk.security.Role;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    public User() {}

    public User(Long id, String email, String name, Role role, String passwordHash) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.role = role;
        this.passwordHash = passwordHash;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
}