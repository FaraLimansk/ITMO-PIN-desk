package ru.itmo.pindesk.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.itmo.pindesk.entity.AssignmentFile;

import java.util.List;

public interface AssignmentFileRepository extends JpaRepository<AssignmentFile, Long> {
    List<AssignmentFile> findByItemId(Long itemId);
}
