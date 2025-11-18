// src/main/java/com/openrun/controller/UserStatisticsController.java
package com.openrun.controller;

import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QuerySnapshot;
import com.openrun.service.UserStatisticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ExecutionException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users/me/statistics")
@Slf4j
public class UserStatisticsController {

    private static final String USER_COLLECTION  = "UserData";
    private static final String STATS_COLLECTION = "StatsData";

    private final Firestore firestore;
    private final UserStatisticsService userStatisticsService;

    /** 개발 편의용 (옵션) */
    @Value("${dev.default.token:}")
    private String devDefaultToken;   // 예: dummy-token
    @Value("${dev.default.userId:}")
    private String devDefaultUserId;  // 예: testuser0815

    /* ===================== 토큰 → userId 해석 (컨트롤러 내부) ===================== */

    private String extractToken(String authHeader) {
        if (authHeader == null || authHeader.isBlank()) return null;
        return authHeader.startsWith("Bearer ") ? authHeader.substring(7).trim() : authHeader.trim();
    }

    /**
     * Authorization 헤더에서 userId를 찾아온다.
     * - dev.default.token/dev.default.userId 설정 시 개발 편의 모드 지원
     * - 정상 경로: UserData.userAutoLoginToken == token 문서에서 userId 필드 사용
     */
    private String resolveUserId(String authorization) throws ExecutionException, InterruptedException {
        String token = extractToken(authorization);

        // (선택) 무토큰일 때 개발용 기본값 허용
        if ((token == null || token.isBlank()) && notBlank(devDefaultToken) && notBlank(devDefaultUserId)) {
            log.warn("[stats][auth] empty token -> use dev default userId={}", devDefaultUserId);
            return devDefaultUserId;
        }

        // (선택) 더미 토큰 매칭
        if (notBlank(token) && notBlank(devDefaultToken) && token.equals(devDefaultToken)) {
            log.warn("[stats][auth] dummy token matched -> userId={}", devDefaultUserId);
            return notBlank(devDefaultUserId) ? devDefaultUserId : null;
        }

        if (!notBlank(token)) {
            log.error("[stats][auth] no token");
            return null;
        }

        // 정상 토큰 조회
        QuerySnapshot qs = firestore.collection(USER_COLLECTION)
                .whereEqualTo("userAutoLoginToken", token)
                .limit(1)
                .get().get();

        if (qs.isEmpty()) {
            log.error("[stats][auth] no user for token={}", token);
            return null;
        }
        String userId = qs.getDocuments().get(0).getString("userId"); // 주의: userId(소문자 d)
        if (!notBlank(userId)) {
            log.error("[stats][auth] user doc has no userId field (docId={})", qs.getDocuments().get(0).getId());
            return null;
        }
        return userId;
    }

    private static boolean notBlank(String s) { return s != null && !s.isBlank(); }

    /* =============================== 엔드포인트 =============================== */

    /**
     * 프론트에서 사용하는 엔드포인트
     * GET /api/users/me/statistics
     * - StatsData/{userId} 문서를 반환
     * - 없으면 즉시 재계산 후 반환
     */
    @GetMapping
    public ResponseEntity<?> getMyStats(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) throws Exception {
        String userId = resolveUserId(authorization);
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("message", "unauthorized"));
        }

        Map<String, Object> data = getOrRecomputeStats(userId);
        return ResponseEntity.ok(data);
    }

    /**
     * 강제 재계산 (선택)
     * POST /api/users/me/statistics/recompute
     */
    @PostMapping("/recompute")
    public ResponseEntity<?> recomputeMyStats(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) throws Exception {
        String userId = resolveUserId(authorization);
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("message", "unauthorized"));
        }

        userStatisticsService.recomputeForUser(userId);
        Map<String, Object> data = fetchStats(userId);

        // 재계산 직후에도 문서가 없을 수 있는 초기 상태 대비
        if (data == null) data = emptyStats(userId);

        return ResponseEntity.ok(data);
    }

    /* =============================== 내부 유틸 =============================== */

    /** StatsData/{userId} 조회, 없으면 재계산 후 한 번 더 조회 */
    private Map<String, Object> getOrRecomputeStats(String userId) throws ExecutionException, InterruptedException {
        Map<String, Object> data = fetchStats(userId);
        if (data != null) return data;

        // 없음 → 재계산
        userStatisticsService.recomputeForUser(userId);
        data = fetchStats(userId);

        // 그래도 없다면 빈 구조 반환(프론트가 기대하는 키들 포함)
        if (data == null) data = emptyStats(userId);
        return data;
    }

    /** StatsData/{userId} 문서 map 반환; 없으면 null */
    private Map<String, Object> fetchStats(String userId) throws ExecutionException, InterruptedException {
        DocumentSnapshot snap = firestore.collection(STATS_COLLECTION).document(userId).get().get();
        return snap.exists() ? snap.getData() : null;
    }

    /** 프론트가 깨지지 않도록 기본 키/타입을 맞춘 빈 통계 구조 */
    private Map<String, Object> emptyStats(String userId) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("userID", userId);
        m.put("total_view", 0);
        m.put("unique_pfm", 0);
        m.put("most_view_pfm", List.of());    // List<Map<String,Object>> 기대
        m.put("most_view_actor", List.of());  // List<Map<String,Object>> 기대
        m.put("stats_timestamp", new Date().toString());
        return m;
    }
}