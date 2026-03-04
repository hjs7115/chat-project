package com.hjs.chatserver.service;

import com.hjs.chatserver.dto.ChatMessage;
import com.hjs.chatserver.entity.ChatMessageEntity;
import com.hjs.chatserver.repository.ChatMessageRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatMessageService {

    private final ChatMessageRepository repo;

    public ChatMessageService(ChatMessageRepository repo) {
        this.repo = repo;
    }

    // 메시지 저장
    public void save(String roomId, ChatMessage msg) {
        repo.save(new ChatMessageEntity(roomId, msg.getSender(), msg.getMessage()));
    }

    // 과거 메시지 N개 조회 (오래된 순으로 정렬해서 반환)
    public List<ChatMessage> getHistory(String roomId, int limit) {
        var latestDesc = repo.findLatestByRoomId(roomId, PageRequest.of(0, limit));
        Collections.reverse(latestDesc); // 최신->과거로 가져온 걸 과거->최신으로 바꿈

        return latestDesc.stream()
                .map(e -> new ChatMessage(e.getSender(), e.getMessage()))
                .collect(Collectors.toList());
    }
}