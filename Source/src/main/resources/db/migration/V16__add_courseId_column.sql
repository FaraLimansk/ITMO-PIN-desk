ALTER TABLE consultation_slots 
ADD COLUMN course_id BIGINT,
ADD CONSTRAINT fk_consultation_slot_course 
FOREIGN KEY (course_id) REFERENCES courses(id);