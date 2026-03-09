package ru.itmo.pindesk.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String term;

    @Column(name = "teacher_id")
    private Long teacherId;

    public Course() {}

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getTerm() { return term; }
    public Long getTeacherId() { return teacherId; }

    public void setTitle(String title) { this.title = title; }
    public void setTerm(String term) { this.term = term; }
    public void setTeacherId(Long teacherId) { this.teacherId = teacherId; }
}