create table users (
  id bigserial primary key,
  email varchar(255) unique,
  full_name varchar(255) not null,
  role varchar(32) not null
);

create table enrollments (
  id bigserial primary key,
  user_id bigint not null references users(id) on delete cascade,
  course_id bigint not null references courses(id) on delete cascade,
  unique(user_id, course_id)
);

create table assessment_categories (
  id bigserial primary key,
  course_id bigint not null references courses(id) on delete cascade,
  title varchar(255) not null,
  max_points integer not null
);

create table assessment_items (
  id bigserial primary key,
  category_id bigint not null references assessment_categories(id) on delete cascade,
  title varchar(255) not null,
  max_points integer not null,
  due_date date,
  sort_order integer not null default 0
);

create table grades (
  id bigserial primary key,
  user_id bigint not null references users(id) on delete cascade,
  item_id bigint not null references assessment_items(id) on delete cascade,
  points integer not null,
  status varchar(32) not null,
  graded_at timestamp without time zone default now(),
  unique(user_id, item_id)
);