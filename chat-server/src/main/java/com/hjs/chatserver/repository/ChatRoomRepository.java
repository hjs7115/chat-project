package com.hjs.chatserver.repository;

import com.hjs.chatserver.entity.ChatRoomEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatRoomRepository extends JpaRepository<ChatRoomEntity, String> {
}