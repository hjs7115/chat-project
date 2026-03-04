package com.hjs.chatserver.controller;

import com.hjs.chatserver.dto.ChatRoomDto;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "*")
public class RoomController {

    private final Map<String, ChatRoomDto> rooms = new ConcurrentHashMap<>();

    @GetMapping
    public List<ChatRoomDto> list() {
        return new ArrayList<>(rooms.values());
    }

    @PostMapping
    public ChatRoomDto create(@RequestParam String name) {
        String roomId = UUID.randomUUID().toString().substring(0, 8);
        ChatRoomDto room = new ChatRoomDto(roomId, name);
        rooms.put(roomId, room);
        return room;
    }
}