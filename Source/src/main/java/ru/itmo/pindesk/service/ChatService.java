package ru.itmo.pindesk.service;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.pindesk.dto.ChatDtos;
import ru.itmo.pindesk.entity.ChatMessage;
import ru.itmo.pindesk.entity.User;
import ru.itmo.pindesk.repo.ChatMessageRepository;
import ru.itmo.pindesk.repo.UserRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    public ChatService(ChatMessageRepository chatMessageRepository, UserRepository userRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ChatDtos.MessageResponse> getMessages(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<ChatMessage> messages = chatMessageRepository.findLatest(pageable);

        if (messages.isEmpty()) {
            return new ArrayList<>();
        }

        // Загружаем всех уникальных отправителей
        Map<Long, User> senders = new HashMap<>();
        for (ChatMessage msg : messages) {
            Long senderId = msg.getSenderId();
            if (senderId != null && !senders.containsKey(senderId)) {
                userRepository.findById(senderId).ifPresent(u -> senders.put(senderId, u));
            }
        }

        // Создаём результат в правильном порядке (старые сначала)
        List<ChatDtos.MessageResponse> result = new ArrayList<>();
        for (int i = messages.size() - 1; i >= 0; i--) {
            ChatMessage msg = messages.get(i);
            User sender = senders.get(msg.getSenderId());
            result.add(toResponse(msg, sender));
        }
        return result;
    }

    @Transactional
    public ChatDtos.MessageResponse sendMessage(Long senderId, String text) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + senderId));

        ChatMessage message = new ChatMessage();
        message.setSender(sender);
        message.setText(text);
        message.setCreatedAt(LocalDateTime.now());
        message.setEdited(false);

        ChatMessage saved = chatMessageRepository.save(message);
        return toResponse(saved, sender);
    }

    @Transactional
    public void deleteMessage(Long messageId, Long userId) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found: " + messageId));

        if (!message.getSenderId().equals(userId)) {
            throw new IllegalArgumentException("Cannot delete another user's message");
        }

        chatMessageRepository.delete(message);
    }

    private ChatDtos.MessageResponse toResponse(ChatMessage message, User sender) {
        String senderName = sender != null ? sender.getName() : "Unknown";
        return new ChatDtos.MessageResponse(
                message.getId(),
                message.getSenderId(),
                senderName,
                message.getText(),
                message.getCreatedAt(),
                message.getEdited()
        );
    }
}
