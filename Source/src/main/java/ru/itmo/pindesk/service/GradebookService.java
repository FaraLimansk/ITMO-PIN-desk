package ru.itmo.pindesk.service;

import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ru.itmo.pindesk.dto.AssignmentFileDto;
import ru.itmo.pindesk.dto.GradebookItemDto;
import ru.itmo.pindesk.dto.GradebookSummaryDto;
import ru.itmo.pindesk.repo.AssignmentFileRepository;
import ru.itmo.pindesk.repo.UserRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class GradebookService {

    private final NamedParameterJdbcTemplate jdbc;
    private final AssignmentFileRepository fileRepository;
    private final UserRepository userRepository;

    public GradebookService(NamedParameterJdbcTemplate jdbc, AssignmentFileRepository fileRepository, UserRepository userRepository) {
        this.jdbc = jdbc;
        this.fileRepository = fileRepository;
        this.userRepository = userRepository;
    }

    public GradebookSummaryDto summary(long courseId, long userId) {
        var params = Map.of("courseId", courseId, "userId", userId);

        // categories summary
        String sqlCategories = """
            select
              c.id as category_id,
              c.title as category_title,
              c.max_points as category_max,
              cast(coalesce(sum(g.points), 0) as int) as earned
            from assessment_categories c
            left join assessment_items i on i.category_id = c.id
            left join grades g on g.item_id = i.id and g.user_id = :userId
            where c.course_id = :courseId
            group by c.id, c.title, c.max_points
            order by c.id
        """;

        List<GradebookSummaryDto.CategorySummary> cats = jdbc.query(sqlCategories, params,
                (rs, rowNum) -> new GradebookSummaryDto.CategorySummary(
                        rs.getLong("category_id"),
                        rs.getString("category_title"),
                        rs.getInt("earned"),
                        rs.getInt("category_max")
                )
        );

        int totalEarned = cats.stream().mapToInt(GradebookSummaryDto.CategorySummary::earnedPoints).sum();
        int totalMax = cats.stream().mapToInt(GradebookSummaryDto.CategorySummary::maxPoints).sum();

        return new GradebookSummaryDto(courseId, userId, totalEarned, totalMax, cats);
    }

    public List<GradebookItemDto> items(long courseId, long userId) {
        var params = Map.of("courseId", courseId, "userId", userId);

        String sql = """
            select
              i.id as item_id,
              c.title as category_title,
              i.title as item_title,
              i.max_points as max_points,
              i.due_date as due_date,
              coalesce(g.points, 0) as points,
              coalesce(g.status, 'NOT_SUBMITTED') as status
            from assessment_categories c
            join assessment_items i on i.category_id = c.id
            left join grades g on g.item_id = i.id and g.user_id = :userId
            where c.course_id = :courseId
            order by c.id, i.sort_order, i.id
        """;

        List<GradebookItemDto> items = jdbc.query(sql, params, (rs, rowNum) -> {
            int points = rs.getInt("points");
            int max = rs.getInt("max_points");
            int progress = (max == 0) ? 0 : (int) Math.round(points * 100.0 / max);

            return new GradebookItemDto(
                    rs.getLong("item_id"),
                    rs.getString("category_title"),
                    rs.getString("item_title"),
                    points,
                    max,
                    rs.getObject("due_date", java.time.LocalDate.class),
                    rs.getString("status"),
                    progress,
                    Collections.emptyList()
            );
        });

        // Добавляем файлы к каждому заданию
        for (GradebookItemDto item : items) {
            List<AssignmentFileDto> files = getFilesForItem(item.itemId());
            items.set(items.indexOf(item), new GradebookItemDto(
                    item.itemId(),
                    item.categoryTitle(),
                    item.title(),
                    item.points(),
                    item.maxPoints(),
                    item.dueDate(),
                    item.status(),
                    item.progressPercent(),
                    files
            ));
        }

        return items;
    }

    private List<AssignmentFileDto> getFilesForItem(long itemId) {
        return fileRepository.findByItemId(itemId).stream()
                .map(f -> {
                    String uploadedByName = f.getUploadedBy() != null ?
                            userRepository.findById(f.getUploadedBy()).map(u -> u.getName()).orElse("Unknown") :
                            null;
                    return new AssignmentFileDto(f.getId(), f.getItemId(), f.getFileName(), f.getFileType(), f.getFileSize(), f.getUploadedAt(), uploadedByName);
                })
                .toList();
    }

    public GradebookItemDto createItem(long courseId, String categoryTitle, String title, int maxPoints, LocalDate dueDate, long teacherId) {
        // Проверяем, что преподаватель ведет этот курс
        String checkCourseSql = """
            select count(*) from courses
            where id = :courseId and teacher_id = :teacherId
        """;
        Integer count = jdbc.queryForObject(checkCourseSql, Map.of("courseId", courseId, "teacherId", teacherId), Integer.class);
        if (count == null || count == 0) {
            throw new IllegalArgumentException("Teacher does not teach this course");
        }

        // Находим или создаем категорию
        String findCategorySql = """
            select id from assessment_categories
            where course_id = :courseId and title = :categoryTitle
        """;
        Long categoryId = jdbc.queryForObject(findCategorySql, Map.of("courseId", courseId, "categoryTitle", categoryTitle), Long.class);

        if (categoryId == null) {
            // Создаем новую категорию
            String insertCategorySql = """
                insert into assessment_categories (course_id, title, max_points, sort_order)
                values (:courseId, :categoryTitle, 0, 0)
            """;
            var params = Map.of("courseId", courseId, "categoryTitle", categoryTitle);
            var keyHolder = new org.springframework.jdbc.support.GeneratedKeyHolder();
            jdbc.update(insertCategorySql, params, keyHolder);
            categoryId = (Long) keyHolder.getKey();
        }

        // Создаем задание
        String insertItemSql = """
            insert into assessment_items (category_id, title, max_points, due_date, sort_order)
            values (:categoryId, :title, :maxPoints, :dueDate, 0)
        """;
        var itemParams = Map.of("categoryId", categoryId, "title", title, "maxPoints", maxPoints, "dueDate", dueDate);
        var keyHolder = new org.springframework.jdbc.support.GeneratedKeyHolder();
        jdbc.update(insertItemSql, itemParams, keyHolder);
        Long itemId = (Long) keyHolder.getKey();

        return new GradebookItemDto(itemId, categoryTitle, title, 0, maxPoints, dueDate, "NOT_SUBMITTED", 0, Collections.emptyList());
    }

    @Transactional
    public AssignmentFileDto uploadFile(long itemId, MultipartFile file, long teacherId) {
        // Проверяем, что преподаватель имеет доступ к заданию
        String checkItemSql = """
            select count(*) from assessment_items i
            join assessment_categories c on c.id = i.category_id
            join courses co on co.id = c.course_id
            where i.id = :itemId and co.teacher_id = :teacherId
        """;
        Integer count = jdbc.queryForObject(checkItemSql, Map.of("itemId", itemId, "teacherId", teacherId), Integer.class);
        if (count == null || count == 0) {
            throw new IllegalArgumentException("Teacher does not have access to this assignment");
        }

        try {
            ru.itmo.pindesk.entity.AssignmentFile assignmentFile = new ru.itmo.pindesk.entity.AssignmentFile();
            assignmentFile.setItemId(itemId);
            assignmentFile.setFileName(file.getOriginalFilename());
            assignmentFile.setFileType(file.getContentType() != null ? file.getContentType() : "application/octet-stream");
            assignmentFile.setFileSize(file.getSize());
            assignmentFile.setFileData(file.getBytes());
            assignmentFile.setUploadedAt(LocalDateTime.now());
            assignmentFile.setUploadedBy(teacherId);

            assignmentFile = fileRepository.save(assignmentFile);

            String uploadedByName = userRepository.findById(teacherId).map(u -> u.getName()).orElse("Unknown");
            return new AssignmentFileDto(assignmentFile.getId(), assignmentFile.getItemId(), assignmentFile.getFileName(), assignmentFile.getFileType(), assignmentFile.getFileSize(), assignmentFile.getUploadedAt(), uploadedByName);
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file", e);
        }
    }

    public byte[] getFileData(long fileId, long userId) {
        ru.itmo.pindesk.entity.AssignmentFile file = fileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("File not found"));

        // Проверяем доступ пользователя к файлу
        String checkAccessSql = """
            select count(*) from assignment_files f
            join assessment_items i on i.id = f.item_id
            join assessment_categories c on c.id = i.category_id
            join courses co on co.id = c.course_id
            left join enrollments e on e.course_id = co.id
            where f.id = :fileId and (co.teacher_id = :userId or e.user_id = :userId)
        """;
        Integer count = jdbc.queryForObject(checkAccessSql, Map.of("fileId", fileId, "userId", userId), Integer.class);
        if (count == null || count == 0) {
            throw new IllegalArgumentException("Access denied");
        }

        return file.getFileData();
    }

    public String getFileName(long fileId) {
        ru.itmo.pindesk.entity.AssignmentFile file = fileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("File not found"));
        return file.getFileName();
    }

    @Transactional
    public void deleteFile(long fileId, long userId) {
        ru.itmo.pindesk.entity.AssignmentFile file = fileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("File not found"));

        // Проверяем, что преподаватель имеет доступ к файлу
        String checkAccessSql = """
            select count(*) from assignment_files f
            join assessment_items i on i.id = f.item_id
            join assessment_categories c on c.id = i.category_id
            join courses co on co.id = c.course_id
            where f.id = :fileId and co.teacher_id = :userId
        """;
        Integer count = jdbc.queryForObject(checkAccessSql, Map.of("fileId", fileId, "userId", userId), Integer.class);
        if (count == null || count == 0) {
            throw new IllegalArgumentException("Access denied");
        }

        fileRepository.delete(file);
    }
}