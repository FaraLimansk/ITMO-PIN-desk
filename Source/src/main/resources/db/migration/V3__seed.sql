-- user
insert into users(id, email, full_name, role)
values (1, 'student@itmo.ru', 'Иван Студент', 'STUDENT')
on conflict do nothing;

-- course (если у тебя уже есть курс, можешь поставить id=1 руками в /api/courses)
insert into courses(id, title, term)
values (1, 'Математический анализ', '2025-2026 Spring')
on conflict do nothing;

insert into enrollments(user_id, course_id)
values (1, 1)
on conflict do nothing;

-- categories
insert into assessment_categories(id, course_id, title, max_points)
values
  (1, 1, 'Лабораторные работы', 40),
  (2, 1, 'Контрольные работы', 40),
  (3, 1, 'Экзамен', 20)
on conflict do nothing;

-- items
insert into assessment_items(id, category_id, title, max_points, due_date, sort_order)
values
  (1, 1, 'Лаб. №1', 10, '2026-02-10', 1),
  (2, 1, 'Лаб. №2', 10, '2026-02-17', 2),
  (3, 1, 'Лаб. №3', 20, '2026-02-24', 3),
  (4, 2, 'Кр. №1', 20, '2026-02-20', 1),
  (5, 2, 'Кр. №2', 20, '2026-02-27', 2),
  (6, 3, 'Экзамен', 20, '2026-03-05', 1)
on conflict do nothing;

-- grades for user 1
insert into grades(user_id, item_id, points, status)
values
  (1, 1, 10, 'PASSED'),
  (1, 2, 8, 'PASSED'),
  (1, 3, 0, 'NOT_SUBMITTED'),
  (1, 4, 15, 'PASSED'),
  (1, 5, 0, 'NOT_SUBMITTED'),
  (1, 6, 0, 'NOT_SUBMITTED')
on conflict do nothing;