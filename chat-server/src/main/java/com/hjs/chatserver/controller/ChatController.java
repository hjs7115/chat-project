package com.hjs.chatserver.controller;

import com.hjs.chatserver.dto.ChatMessage;
import com.hjs.chatserver.service.ChatMessageService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageService chatMessageService;

    public ChatController(SimpMessagingTemplate messagingTemplate, ChatMessageService chatMessageService) {
        this.messagingTemplate = messagingTemplate;
        this.chatMessageService = chatMessageService;
    }

    @MessageMapping("/chat.send/{roomId}")
    public void send(@DestinationVariable String roomId, ChatMessage message) {
        chatMessageService.save(roomId, message);

        messagingTemplate.convertAndSend("/sub/chat/room/" + roomId, message);
    }
}