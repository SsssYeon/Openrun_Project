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

    @PostMapping(value = "/signup", produces = "application/json; charset=UTF-8")
    public ResponseEntity<Map<String, String>> signup(@RequestBody SignupRequest request) {
        Map<String, String> result = new HashMap<>();
        try {
            authService.signup(request);
            result.put("message", "회원가입 성공!");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("message", "회원가입 실패: " + e.getMessage());
            return ResponseEntity.badRequest().body(result);
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
