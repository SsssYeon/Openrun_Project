// src/main/java/com/openrun/service/PfmCalendarService.java
package com.openrun.service;

import com.google.cloud.firestore.*;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.Bucket;
import com.google.firebase.cloud.StorageClient;
import com.openrun.dto.PfmCalendarDTO;
import com.openrun.dto.PfmCalendarUpdateRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.ExecutionException;

@Service
@RequiredArgsConstructor
@Slf4j
public class PfmCalendarService {

    private static final String USER_COLLECTION   = "UserData";
    private static final String RECORD_COLLECTION = "RecordData";

    private final Firestore firestore;
    private final StorageClient storageClient;
    private final UserStatisticsService userStatisticsService;


    private String extractToken(String authHeader) {
        if (authHeader == null || authHeader.isBlank()) return null;
        return authHeader.startsWith("Bearer ") ? authHeader.substring(7).trim() : authHeader.trim();
    }

    /* Authorization 헤더 → userId */
    public String resolveUserId(String authHeader) throws ExecutionException, InterruptedException {
        String token = extractToken(authHeader);

        QuerySnapshot qs = firestore.collection(USER_COLLECTION)
                .whereEqualTo("userAutoLoginToken", token)
                .limit(1)
                .get().get();

        if (qs.isEmpty()) {
            log.error("[auth] no user for token={}", token);
            return null;
        }
        String userId = qs.getDocuments().get(0).getString("userId"); // 필드명 주의: userId(소문자 d)
        if (userId == null || userId.isBlank()) {
            log.error("[auth] user doc has no userId field (docId={})", qs.getDocuments().get(0).getId());
            return null;
        }
        return userId;
    }

    private boolean isOwner(String userId, DocumentSnapshot doc) {
        return Objects.equals(doc.getString("userDocumentId"), userId);
    }

    private PfmCalendarDTO mapDocToDto(DocumentSnapshot doc) {
        PfmCalendarDTO dto = new PfmCalendarDTO();
        dto.setPfmcalender_doc_no(doc.getId());
        dto.setPfmcalender_nm(doc.getString("pfmcalender_nm"));
        dto.setPfmcalender_date(doc.getString("pfmcalender_date"));
        dto.setPfmcalender_time(doc.getString("pfmcalender_time"));

        String place = doc.getString("pfmcalender_place");
        String legacyLoc = doc.getString("pfmcalender_location");
        dto.setPfmcalender_location(place != null ? place : legacyLoc);

        dto.setPfmcalender_today_cast(doc.getString("pfmcalender_today_cast"));
        dto.setPfmcalender_seat(doc.getString("pfmcalender_seat"));
        Object costRaw = doc.get("pfmcalender_cost");
        dto.setPfmcalender_cost(costRaw == null ? null : String.valueOf(costRaw));
        dto.setPfmcalender_memo(doc.getString("pfmcalender_memo"));
        dto.setPfmcalender_poster(doc.getString("pfmcalender_poster"));
        dto.setPfmcalender_bookingsite(doc.getString("pfmcalender_bookingsite"));
        return dto;
    }

    /* Firebase Storage 업로드 */
    private String uploadPosterImage(MultipartFile file) {
        if (file == null || file.isEmpty()) return null;
        try {
            Bucket bucket = storageClient.bucket();
            if (bucket == null) {
                log.error("[storage] default bucket is null");
                return null;
            }
            String original = (file.getOriginalFilename() == null ? "poster" : file.getOriginalFilename())
                    .replaceAll("\\s+", "_");
            String blobName = "posters/" + UUID.randomUUID() + "_" + original;
            String contentType = (file.getContentType() == null || file.getContentType().isBlank())
                    ? "application/octet-stream" : file.getContentType();

            Blob blob = bucket.create(blobName, file.getBytes(), contentType);

            return "https://firebasestorage.googleapis.com/v0/b/"
                    + bucket.getName() + "/o/"
                    + URLEncoder.encode(blob.getName(), StandardCharsets.UTF_8)
                    + "?alt=media";
        } catch (Exception e) {
            log.error("[storage] poster upload failed: {}", e.toString(), e);
            return null;
        }
    }

    private void putIfNotNull(Map<String, Object> m, String k, String v) {
        if (v != null) m.put(k, v);
    }

    private void putCostSmart(Map<String, Object> m, String cost) {
        if (cost == null || cost.isBlank()) return;
        String trimmed = cost.replace(",", "").trim();
        try { m.put("pfmcalender_cost", Integer.parseInt(trimmed)); }
        catch (NumberFormatException ignore) { m.put("pfmcalender_cost", cost); }
    }

    /* ================= 조회 ================= */

    public List<PfmCalendarDTO> getAllEventsForMe(String authHeader) throws Exception {
        String userId = resolveUserId(authHeader);
        if (userId == null) return List.of();

        QuerySnapshot qs = firestore.collection(RECORD_COLLECTION)
                .whereEqualTo("userDocumentId", userId)
                .get().get();

        List<PfmCalendarDTO> list = new ArrayList<>();
        for (DocumentSnapshot d : qs.getDocuments()) list.add(mapDocToDto(d));
        list.sort(Comparator.comparing(PfmCalendarDTO::getPfmcalender_date, Comparator.nullsLast(String::compareTo)));
        return list;
    }

    public PfmCalendarDTO getMyEventById(String authHeader, String id) throws Exception {
        String userId = resolveUserId(authHeader);
        if (userId == null) return null;

        DocumentSnapshot doc = firestore.collection(RECORD_COLLECTION).document(id).get().get();
        if (!doc.exists() || !isOwner(userId, doc)) return null;
        return mapDocToDto(doc);
    }

    /* ================= 생성 ================= */

    public String addMyEvent(String authHeader,
                             String name, String date, String time, String location,
                             String seat, String cast, String cost, String memo, String bookingsite,
                             MultipartFile posterFile) throws Exception {

        String userId = resolveUserId(authHeader);
        if (userId == null) throw new IllegalStateException("UNAUTHORIZED");

        Map<String, Object> data = new HashMap<>();
        data.put("userDocumentId", userId);
        data.put("pfmcalender_nm", name);
        data.put("pfmcalender_date", date);
        putIfNotNull(data, "pfmcalender_time", time);

        if (location != null) {
            data.put("pfmcalender_place", location);
            data.put("pfmcalender_location", location);
        }
        putIfNotNull(data, "pfmcalender_seat", seat);
        putIfNotNull(data, "pfmcalender_today_cast", cast);
        putIfNotNull(data, "pfmcalender_bookingsite", bookingsite);
        putCostSmart(data, cost);
        putIfNotNull(data, "pfmcalender_memo", memo);

        String posterUrl = uploadPosterImage(posterFile);
        if (posterUrl != null) data.put("pfmcalender_poster", posterUrl);

        data.putIfAbsent("pfmcalender_state", 1);
        data.putIfAbsent("pfmcalender_share", 1);
        data.put("pfmcalender_timestamp", String.valueOf(System.currentTimeMillis()));

        DocumentReference ref = firestore.collection(RECORD_COLLECTION).document();
        ref.set(data).get();

        // 통계 재계산
        userStatisticsService.recomputeForUser(userId);

        return ref.getId();
    }

    public String addMyEventJson(String authHeader, PfmCalendarUpdateRequest req) throws Exception {
        String userId = resolveUserId(authHeader);
        if (userId == null) throw new IllegalStateException("UNAUTHORIZED");

        Map<String, Object> data = new HashMap<>();
        data.put("userDocumentId", userId);
        putIfNotNull(data, "pfmcalender_nm", req.getPfmcalender_nm());
        putIfNotNull(data, "pfmcalender_date", req.getPfmcalender_date());
        putIfNotNull(data, "pfmcalender_time", req.getPfmcalender_time());
        if (req.getPfmcalender_location() != null) {
            data.put("pfmcalender_place", req.getPfmcalender_location());
            data.put("pfmcalender_location", req.getPfmcalender_location());
        }
        putIfNotNull(data, "pfmcalender_seat", req.getPfmcalender_seat());
        putIfNotNull(data, "pfmcalender_today_cast", req.getPfmcalender_today_cast());
        putIfNotNull(data, "pfmcalender_bookingsite", req.getPfmcalender_bookingsite());
        putCostSmart(data, req.getPfmcalender_cost());
        putIfNotNull(data, "pfmcalender_memo", req.getPfmcalender_memo());

        data.putIfAbsent("pfmcalender_state", 1);
        data.putIfAbsent("pfmcalender_share", 1);
        data.put("pfmcalender_timestamp", String.valueOf(System.currentTimeMillis()));

        DocumentReference ref = firestore.collection(RECORD_COLLECTION).document();
        ref.set(data).get();

        // 통계 재계산
        userStatisticsService.recomputeForUser(userId);

        return ref.getId();
    }

    /* ================= 수정/삭제 ================= */

    public ResponseEntity<String> updateMyEventJsonResponse(String authHeader, String id, PfmCalendarUpdateRequest req) throws Exception {
        String result = updateMyEventJson(authHeader, id, req);
        return switch (result) {
            case "updated"   -> ResponseEntity.ok("updated");
            case "no_change" -> ResponseEntity.ok("no_change");
            case "not_found" -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("not_found");
            case "forbidden" -> ResponseEntity.status(HttpStatus.FORBIDDEN).body("forbidden");
            default          -> ResponseEntity.badRequest().body(result);
        };
    }

    public String updateMyEventJson(String authHeader, String id, PfmCalendarUpdateRequest req) throws Exception {
        String userId = resolveUserId(authHeader);
        if (userId == null) return "forbidden";

        DocumentReference ref = firestore.collection(RECORD_COLLECTION).document(id);
        DocumentSnapshot doc = ref.get().get();
        if (!doc.exists()) return "not_found";
        if (!isOwner(userId, doc)) return "forbidden";

        Map<String, Object> update = new HashMap<>();
        putIfNotNull(update, "pfmcalender_nm", req.getPfmcalender_nm());
        putIfNotNull(update, "pfmcalender_date", req.getPfmcalender_date());
        putIfNotNull(update, "pfmcalender_time", req.getPfmcalender_time());
        if (req.getPfmcalender_location() != null) {
            update.put("pfmcalender_place", req.getPfmcalender_location());
            update.put("pfmcalender_location", req.getPfmcalender_location());
        }
        putIfNotNull(update, "pfmcalender_seat", req.getPfmcalender_seat());
        putIfNotNull(update, "pfmcalender_today_cast", req.getPfmcalender_today_cast());
        putIfNotNull(update, "pfmcalender_bookingsite", req.getPfmcalender_bookingsite());
        putCostSmart(update, req.getPfmcalender_cost());
        putIfNotNull(update, "pfmcalender_memo", req.getPfmcalender_memo());

        if (update.isEmpty()) return "no_change";
        ref.update(update).get();

        // 통계 재계산
        userStatisticsService.recomputeForUser(userId);

        return "updated";
    }

    public ResponseEntity<String> deleteMyEventResponse(String authHeader, String id) throws Exception {
        String result = deleteMyEvent(authHeader, id);
        return switch (result) {
            case "deleted"   -> ResponseEntity.ok("deleted");
            case "not_found" -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("not_found");
            case "forbidden" -> ResponseEntity.status(HttpStatus.FORBIDDEN).body("forbidden");
            default          -> ResponseEntity.badRequest().body(result);
        };
    }

    public String deleteMyEvent(String authHeader, String id) throws Exception {
        String userId = resolveUserId(authHeader);
        if (userId == null) return "forbidden";

        DocumentReference ref = firestore.collection(RECORD_COLLECTION).document(id);
        DocumentSnapshot doc = ref.get().get();
        if (!doc.exists()) return "not_found";
        if (!isOwner(userId, doc)) return "forbidden";

        ref.delete().get();

        // 통계 재계산
        userStatisticsService.recomputeForUser(userId);

        return "deleted";
    }
}