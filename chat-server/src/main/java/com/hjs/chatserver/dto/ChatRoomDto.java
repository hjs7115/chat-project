package com.hjs.chatserver.dto;

public class ChatRoomDto {
    private String roomId;
    private String name;

    public ChatRoomDto() {}

    public ChatRoomDto(String roomId, String name) {
        this.roomId = roomId;
        this.name = name;
    }

    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}