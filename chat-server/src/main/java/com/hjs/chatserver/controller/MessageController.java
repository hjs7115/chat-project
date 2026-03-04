package com.hjs.chatserver.controller;

import com.hjs.chatserver.dto.ChatMessage;
import com.hjs.chatserver.service.ChatMessageService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "*")
public class MessageController {

    private final ChatMessageService service;

    public MessageController(ChatMessageService service) {
        this.service = service;
    }

    @GetMapping("/{roomId}/messages")
    public List<ChatMessage> history(@PathVariable String roomId,
                                     @RequestParam(defaultValue = "50") int limit) {
        return service.getHistory(roomId, limit);
    }
}