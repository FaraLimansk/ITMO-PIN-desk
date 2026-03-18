-- Assign teacher to existing courses
-- Using the test teacher user (test@teacher.com)

UPDATE courses 
SET teacher_id = (SELECT id FROM users WHERE email = 'test@teacher.com')
WHERE teacher_id IS NULL;
