package com.openrun.controller;

import com.openrun.dto.ChangePasswordRequest;
import com.openrun.dto.DeleteAccountRequest;
import com.openrun.dto.LoginRequest;
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
            response.put("exists", false);
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Map<String, String> result = authService.login(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/autologin")
    public ResponseEntity<?> autoLogin(@RequestParam("token") String token) {
        try {
            Map<String, String> result = authService.autoLogin(token);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/find-id")
    public ResponseEntity<?> findId(@RequestBody Map<String, String> req) {
        try {
            String email = authService.findUserId(req.get("user_nm"), req.get("user_phonenum"));
            return ResponseEntity.ok(Map.of("user_id", email));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> req) {
        try {
            String tempPw = authService.resetPassword(
                    req.get("user_id"),
                    req.get("user_nm"),
                    req.get("user_phonenum")
            );
            return ResponseEntity.ok(Map.of("temp_pw", tempPw, "message", "임시 비밀번호로 재설정되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        try {
            String message = authService.changePassword(request);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/delete-account")
    public ResponseEntity<?> deleteAccount(@RequestBody DeleteAccountRequest request) {
        try {
            String message = authService.deleteAccount(request);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
