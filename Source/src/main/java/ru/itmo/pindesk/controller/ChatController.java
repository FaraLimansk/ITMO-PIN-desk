package ru.itmo.pindesk.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.itmo.pindesk.dto.ChatDtos;
import ru.itmo.pindesk.service.ChatService;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/messages")
    public ResponseEntity<List<ChatDtos.MessageResponse>> getMessages(
            @RequestParam(defaultValue = "100") int limit
    ) {
        List<ChatDtos.MessageResponse> messages = chatService.getMessages(limit);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/messages")
    public ResponseEntity<ChatDtos.MessageResponse> sendMessage(
            @RequestBody ChatDtos.SendMessageRequest request
    ) {
        // Используем тестового пользователя (id=1)
        ChatDtos.MessageResponse response = chatService.sendMessage(1L, request.text());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/messages/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long id) {
        chatService.deleteMessage(id, 1L);
        return ResponseEntity.ok().build();
    }
}
