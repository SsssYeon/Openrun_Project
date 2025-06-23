package com.openrun.controller;

import com.openrun.dto.SignupRequest;
import com.openrun.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody SignupRequest request) {
        try {
            authService.signup(request);
            return ResponseEntity.ok("회원가입 성공!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("회원가입 실패: " + e.getMessage());
        }
    }

    @GetMapping("/check-id")
    public ResponseEntity<Map<String, Boolean>> checkId(@RequestParam String user_id) {
        Map<String, Boolean> response = new HashMap<>();
        try {
            boolean isDuplicate = authService.isEmailDuplicate(user_id);
            response.put("exists", isDuplicate);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            // 서버 에러가 나도 중복이 아니라고 알려주거나, 적절한 오류 메시지를 프론트에 내려줘야 해
            response.put("exists", false);
            return ResponseEntity.status(500).body(response);
        }
    }
}
