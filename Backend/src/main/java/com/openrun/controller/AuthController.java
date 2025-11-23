package com.openrun.controller;

import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import com.openrun.dto.ChangePasswordRequestDTO;
import com.openrun.dto.DeleteAccountRequestDTO;
import com.openrun.dto.LoginRequestDTO;
import com.openrun.dto.SignupRequestDTO;
import com.openrun.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final Firestore firestore = FirestoreClient.getFirestore();
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** 회원가입 **/
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequestDTO request) {
        try {
            authService.signup(request);
            return ResponseEntity.ok(Map.of("message", "회원가입 성공!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "회원가입 실패: " + e.getMessage()));
        }
    }

    /** userId 중복 확인 **/
    @GetMapping("/check-id")
    public ResponseEntity<?> checkId(@RequestParam("user_id") String user_id) {
        try {
            boolean exists = authService.isEmailDuplicate(user_id);
            return ResponseEntity.ok(Map.of("exists", exists));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("exists", false));
        }
    }

    /** 로그인 **/
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO request) {
        try {
            Map<String, Object> result = authService.login(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "아이디 또는 비밀번호를 확인하세요."));
        }
    }

    /** 자동 로그인 **/
    @GetMapping("/autologin")
    public ResponseEntity<?> autoLogin(@RequestParam("token") String token) {
        try {
            Map<String, Object> result = authService.autoLogin(token);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** 로그아웃(토큰 무효화) **/
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        if (token == null)
            return ResponseEntity.status(400).body(Map.of("message", "토큰이 없습니다."));

        // 프론트에서는 토큰 삭제만 하면 충분, 백에서는 선택적으로 토큰 만료 처리
        return ResponseEntity.ok(Map.of("message", "로그아웃 성공"));
    }
    private String extractToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        return authHeader.substring(7).trim();
    }

    /** 아이디 찾기 **/
    @PostMapping("/find-id")
    public ResponseEntity<?> findId(@RequestBody Map<String, String> req) {
        try {
            String userId = authService.findUserId(req.get("user_nm"), req.get("user_phonenum"));
            return ResponseEntity.ok(Map.of("user_id", userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** 비밀번호 찾기 **/
    @PostMapping("/find-password")
    public ResponseEntity<?> findPassword(@RequestBody Map<String, String> req) {
        String userId = req.get("user_id");
        String phone = req.get("user_phonenum");
        try {
            authService.verifyUserForPasswordReset(userId, phone);
            return ResponseEntity.ok(Map.of("user_id", userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** 비밀번호 재설정 **/
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> req) {
        String userId = req.get("user_id");
        String phone = req.get("user_phonenum");
        String newPassword = req.get("new_password");

        try {
            authService.resetPasswordByPhone(userId, newPassword);
            return ResponseEntity.ok(Map.of("message", "비밀번호가 성공적으로 변경되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** 비밀번호 변경 **/
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequestDTO request) {
        try {
            String message = authService.changePassword(request);
            return ResponseEntity.ok(Map.of("message", message));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** 회원 탈퇴 **/
    @DeleteMapping("/delete-account")
    public ResponseEntity<?> deleteAccount(@RequestBody DeleteAccountRequestDTO request) {
        try {
            String message = authService.deleteAccount(request);
            return ResponseEntity.ok(Map.of("message", message));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
