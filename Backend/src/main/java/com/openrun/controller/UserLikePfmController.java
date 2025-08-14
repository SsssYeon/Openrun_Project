package com.openrun.controller;

import com.openrun.service.UserLikePfmService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users/me/interests")
public class UserLikePfmController {

    private final UserLikePfmService service;

    public UserLikePfmController(UserLikePfmService service) {
        this.service = service;
    }

    // 관심공연 목록 조회
    @GetMapping
    public ResponseEntity<?> getFavorites(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = extractToken(authHeader);
            if (token == null) return ResponseEntity.badRequest().body(Map.of("message", "토큰이 없습니다."));

            List<Map<String, Object>> favorites = service.getUserFavorites(token);
            return ResponseEntity.ok(favorites);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // 공연 상세 조회
    @GetMapping("/{pfmDocId}")
    public ResponseEntity<?> getPerformanceDetail(@PathVariable String pfmDocId) {
        try {
            Map<String, Object> detail = service.getPerformanceDetail(pfmDocId);
            return ResponseEntity.ok(detail);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    private String extractToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        return authHeader.substring(7).trim();
    }
}
