package ru.itmo.pindesk.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(name = "text", nullable = false, columnDefinition = "TEXT")
    private String text;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "edited", nullable = false)
    private Boolean edited = false;

    public ChatMessage() {}

    public ChatMessage(Long id, User sender, String text, LocalDateTime createdAt, Boolean edited) {
        this.id = id;
        this.sender = sender;
        this.text = text;
        this.createdAt = createdAt;
        this.edited = edited;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }

    public Long getSenderId() { return sender != null ? sender.getId() : null; }
    public void setSenderId(Long senderId) { 
        if (this.sender == null) {
            this.sender = new User();
            this.sender.setId(senderId);
        } else {
            this.sender.setId(senderId);
        }
    }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Boolean getEdited() { return edited; }
    public void setEdited(Boolean edited) { this.edited = edited; }
}
