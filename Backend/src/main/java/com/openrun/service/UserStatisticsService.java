// src/main/java/com/openrun/service/UserStatisticsService.java
package com.openrun.service;

import com.google.cloud.firestore.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserStatisticsService {

    private static final String RECORD_COLLECTION = "RecordData";
    private static final String STATS_COLLECTION  = "StatsData";

    private final Firestore firestore;

    /* userId 기준으로 통계 전량 재계산하고 StatsData/{userId}에 저장 */
    public void recomputeForUser(String userId) {
        try {
            if (userId == null || userId.isBlank()) return;

            QuerySnapshot qs = firestore.collection(RECORD_COLLECTION)
                    .whereEqualTo("userDocumentId", userId)
                    .get().get();

            List<QueryDocumentSnapshot> docs = qs.getDocuments();

            int totalView = docs.size();

            // 작품별 집계
            Map<String, Integer> pfmCount = new HashMap<>();
            for (DocumentSnapshot d : docs) {
                String nm = nvl(d.getString("pfmcalender_nm")).trim();
                if (!nm.isBlank()) pfmCount.merge(nm, 1, Integer::sum);
            }

            // 배우별 집계 (공백/쉼표/슬래시/가운데점 등 분리)
            Map<String, Integer> actorCount = new HashMap<>();
            Pattern splitter = Pattern.compile("[\\s,/·ㆍ]+");
            for (DocumentSnapshot d : docs) {
                String castRaw = nvl(d.getString("pfmcalender_today_cast")).trim();
                if (castRaw.isBlank()) continue;
                for (String token : splitter.split(castRaw)) {
                    String name = token.trim();
                    if (!name.isBlank()) actorCount.merge(name, 1, Integer::sum);
                }
            }

            int uniquePfm = pfmCount.keySet().size();

            List<Map<String, Object>> mostViewPfm = pfmCount.entrySet().stream()
                    .sorted((a, b) -> Integer.compare(b.getValue(), a.getValue()))
                    .map(e -> row("pfm_nm", e.getKey(), "pfm_cnt", e.getValue()))
                    .collect(Collectors.toList());

            List<Map<String, Object>> mostViewActor = actorCount.entrySet().stream()
                    .sorted((a, b) -> Integer.compare(b.getValue(), a.getValue()))
                    .map(e -> row("actor_nm", e.getKey(), "actor_cnt", e.getValue()))
                    .collect(Collectors.toList());

            Map<String, Object> statsDoc = new HashMap<>();
            statsDoc.put("userID", userId);
            statsDoc.put("total_view", totalView);
            statsDoc.put("unique_pfm", uniquePfm);
            statsDoc.put("most_view_pfm", mostViewPfm);
            statsDoc.put("most_view_actor", mostViewActor);
            statsDoc.put("stats_timestamp", Date.from(Instant.now()).toString());

            firestore.collection(STATS_COLLECTION).document(userId).set(statsDoc).get();
            log.info("[stats] recomputed for userId={} :: total_view={}, unique_pfm={}", userId, totalView, uniquePfm);
        } catch (ExecutionException | InterruptedException e) {
            log.error("[stats] recompute failed for userId={}: {}", userId, e.toString(), e);
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            log.error("[stats] unexpected error for userId={}: {}", userId, e.toString(), e);
        }
    }

    /* 저장된 통계를 그대로 반환 (없으면 null) */
    public Map<String, Object> readStatsDoc(String userId) throws ExecutionException, InterruptedException {
        if (userId == null || userId.isBlank()) return null;
        DocumentSnapshot snap = firestore.collection(STATS_COLLECTION).document(userId).get().get();
        return snap.exists() ? snap.getData() : null;
    }

    /* helpers */
    private static String nvl(String s) { return s == null ? "" : s; }
    private static Map<String, Object> row(String k1, Object v1, String k2, Object v2) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put(k1, v1); m.put(k2, v2);
        return m;
    }
}