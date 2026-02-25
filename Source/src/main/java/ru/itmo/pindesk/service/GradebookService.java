package ru.itmo.pindesk.service;

import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import ru.itmo.pindesk.dto.GradebookItemDto;
import ru.itmo.pindesk.dto.GradebookSummaryDto;

import java.util.List;
import java.util.Map;

@Service
public class GradebookService {

    private final NamedParameterJdbcTemplate jdbc;

    public GradebookService(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public GradebookSummaryDto summary(long courseId, long userId) {
        var params = Map.of("courseId", courseId, "userId", userId);

        // categories summary
        String sqlCategories = """
            select
              c.id as category_id,
              c.title as category_title,
              c.max_points as category_max,
              coalesce(sum(g.points), 0) as earned
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

        return jdbc.query(sql, params, (rs, rowNum) -> {
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
                    progress
            );
        });
    }
}