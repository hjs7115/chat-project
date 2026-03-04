package com.hjs.chatserver.repository;

import com.hjs.chatserver.entity.ChatMessageEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity, Long> {

    // 최신 메시지 N개 가져오기(내림차순)
    @Query("select m from ChatMessageEntity m where m.roomId = :roomId order by m.createdAt desc")
    List<ChatMessageEntity> findLatestByRoomId(String roomId, Pageable pageable);
}