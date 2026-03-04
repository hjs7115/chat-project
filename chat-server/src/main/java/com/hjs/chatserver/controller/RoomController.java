package com.hjs.chatserver.controller;

import com.hjs.chatserver.dto.ChatRoomDto;
import com.hjs.chatserver.entity.ChatRoomEntity;
import com.hjs.chatserver.repository.ChatRoomRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "*")
public class RoomController {

    private final ChatRoomRepository chatRoomRepository;

    public RoomController(ChatRoomRepository chatRoomRepository) {
        this.chatRoomRepository = chatRoomRepository;
    }

    @GetMapping
    public List<ChatRoomDto> list() {
        return chatRoomRepository.findAll().stream()
                .map(r -> new ChatRoomDto(r.getRoomId(), r.getName()))
                .toList();
    }

    @PostMapping
    public ChatRoomDto create(@RequestParam String name) {
        String roomId = UUID.randomUUID().toString().substring(0, 8);

        ChatRoomEntity entity = new ChatRoomEntity(roomId, name);
        chatRoomRepository.save(entity);

        return new ChatRoomDto(entity.getRoomId(), entity.getName());
    }
}