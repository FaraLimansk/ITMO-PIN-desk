package ru.itmo.pindesk.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.itmo.pindesk.entity.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);
}