    package com.openrun.controller;

    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.*;

    import java.util.Map;
    import java.util.concurrent.ConcurrentHashMap;

    @RestController
    @RequestMapping("/api/auth/verify")
    public class PhoneVerificationController {
        private final Map<String, String> phoneCodeMap = new ConcurrentHashMap<>();

        /**인증번호 전송**/
        @PostMapping("/send")
        public ResponseEntity<?> sendCode(@RequestBody Map<String, String> request) {
            String phone = request.get("user_phonenum");
            String purpose = request.get("purpose");

            if (phone == null || phone.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "휴대폰 번호가 필요합니다."));
            }

            String fixedCode = "123456";

            phoneCodeMap.put(phone, fixedCode);

            return ResponseEntity.ok(Map.of("message", "인증번호가 전송되었습니다.", "code", fixedCode));
        }

        /**인증번호 확인**/
        @PostMapping("/check")
        public ResponseEntity<?> verifyCode(@RequestBody Map<String, String> request) {
            String phone = request.get("user_phonenum");
            String code = request.get("code");
            String purpose = request.get("purpose");

            if (phone == null || code == null || phone.isEmpty() || code.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "휴대폰 번호와 인증번호를 모두 입력해주세요."));
            }

            String savedCode = phoneCodeMap.get(phone);
            if (savedCode != null && savedCode.equals(code)) {
                // 인증 성공 시 저장소에서 삭제해도 됨 (재사용 방지)
                phoneCodeMap.remove(phone);
                return ResponseEntity.ok(Map.of("success", true, "message", "인증 성공!"));
            } else {
                return ResponseEntity.ok(Map.of("success", false, "message", "잘못된 인증번호입니다."));
            }
        }
    }
