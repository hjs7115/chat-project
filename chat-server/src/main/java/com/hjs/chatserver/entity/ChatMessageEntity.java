package com.hjs.chatserver.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_message")
public class ChatMessageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_id", nullable = false, length = 50)
    private String roomId;

    @Column(nullable = false, length = 50)
    private String sender;

    @Column(nullable = false, length = 2000)
    private String message;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public ChatMessageEntity() {}

    public ChatMessageEntity(String roomId, String sender, String message) {
        this.roomId = roomId;
        this.sender = sender;
        this.message = message;
    }

    public Long getId() { return id; }
    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }
    public String getSender() { return sender; }
    public void setSender(String sender) { this.sender = sender; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}