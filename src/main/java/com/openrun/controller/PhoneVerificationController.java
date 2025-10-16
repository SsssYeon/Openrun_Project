    package com.openrun.controller;

    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.*;

    import java.util.Map;
    import java.util.concurrent.ConcurrentHashMap;

    @RestController
    @RequestMapping("/api/auth/verify")
    public class PhoneVerificationController {

        // 임시 저장소: 휴대폰 번호 - 인증번호 매핑 (쓰레드 안전하게)
        private final Map<String, String> phoneCodeMap = new ConcurrentHashMap<>();

        // 인증번호 전송 (테스트용: 실제 문자 발송 없이 고정된 인증번호 사용)
        @PostMapping("/send")
        public ResponseEntity<?> sendCode(@RequestBody Map<String, String> request) {
            String phone = request.get("user_phonenum");
            String purpose = request.get("purpose");

            if (phone == null || phone.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "휴대폰 번호가 필요합니다."));
            }

            // 테스트용 고정 인증번호 (원하는 숫자로 바꿔도 됨)
            String fixedCode = "123456";

            // 저장 (나중에 인증할 때 비교용)
            phoneCodeMap.put(phone, fixedCode);

            // 실제 SMS 전송 안 함
            return ResponseEntity.ok(Map.of("message", "인증번호가 전송되었습니다.", "code", fixedCode));
            // code 필드는 테스트 편의를 위해 응답에 넣은 것, 실제 배포 땐 빼세요.
        }

        // 인증번호 확인
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
