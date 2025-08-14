// src/main/java/com/openrun/service/PfmCalendarService.java
package com.openrun.service;

import com.google.cloud.firestore.*;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.Bucket;
import com.google.firebase.cloud.StorageClient;
import com.openrun.dto.PfmCalendarDTO;
import com.openrun.dto.PfmCalendarUpdateRequest;
import lombok.RequiredArgsConstructor;
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
public class PfmCalendarService {

    private static final String USER_COLLECTION   = "UserData";
    private static final String RECORD_COLLECTION = "RecordData";

    private final Firestore firestore;

    /* =============== 공통 유틸 =============== */

    private String extractToken(String authHeader) {
        if (authHeader == null || authHeader.isBlank()) return "dummy-token";
        return authHeader.startsWith("Bearer ")
                ? authHeader.substring(7).trim()
                : authHeader.trim();
    }

    /** 토큰 → UserData.userAutoLoginToken 매칭 → userID 반환. 없으면 dummy-token → testuser */
    private String getUserIdByToken(String authHeader) throws ExecutionException, InterruptedException {
        String token = extractToken(authHeader);

        QuerySnapshot qs = firestore.collection(USER_COLLECTION)
                .whereEqualTo("userAutoLoginToken", token)
                .limit(1)
                .get().get();

        if (!qs.isEmpty()) {
            DocumentSnapshot userDoc = qs.getDocuments().get(0);
            return userDoc.getString("userID"); // RecordData.userDocumentId와 동일해야 함
        }
        if ("dummy-token".equals(token)) return "testuser";
        return null;
    }

    private boolean isOwnerOrDevBypass(String userId, DocumentSnapshot doc, String token) {
        String owner = doc.getString("userDocumentId");
        if (Objects.equals(owner, userId)) return true;
        if ("dummy-token".equals(token)) return true; // 개발 편의
        return false;
    }

    private PfmCalendarDTO mapDocToDto(DocumentSnapshot doc) {
        PfmCalendarDTO dto = new PfmCalendarDTO();
        dto.setPfmcalender_doc_no(doc.getId());
        dto.setPfmcalender_nm(doc.getString("pfmcalender_nm"));
        dto.setPfmcalender_date(doc.getString("pfmcalender_date"));
        dto.setPfmcalender_time(doc.getString("pfmcalender_time"));

        // DB는 place, 응답은 location
        String place = doc.getString("pfmcalender_place");
        String backup = doc.getString("pfmcalender_location");
        dto.setPfmcalender_location(place != null ? place : backup);

        String cast = doc.getString("pfmcalender_today_cast");
        if (cast == null) cast = doc.getString("pfmcr_today_cast"); // 과거 오타 호환
        dto.setPfmcalender_today_cast(cast);

        dto.setPfmcalender_seat(doc.getString("pfmcalender_seat"));

        Object costRaw = doc.get("pfmcalender_cost");
        dto.setPfmcalender_cost(costRaw != null ? String.valueOf(costRaw) : null);

        dto.setPfmcalender_memo(doc.getString("pfmcalender_memo"));
        dto.setPfmcalender_poster(doc.getString("pfmcalender_poster"));
        dto.setPfmcalender_bookingsite(doc.getString("pfmcalender_bookingsite"));
        return dto;
    }

    private String uploadPosterImage(MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) return null;
        Bucket bucket = StorageClient.getInstance().bucket();
        String blobName = "posters/" + UUID.randomUUID() + "_" + file.getOriginalFilename();
        Blob blob = bucket.create(blobName, file.getBytes(), file.getContentType());
        return String.format(
                "https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media",
                bucket.getName(), URLEncoder.encode(blob.getName(), StandardCharsets.UTF_8)
        );
    }

    private void putIfNotNull(Map<String, Object> map, String key, String value) {
        if (value != null) map.put(key, value);
    }

    /** 문자열/숫자 모두 수용: "12,000" → 12000, "무료" → "무료" */
    private void putCostSmart(Map<String, Object> map, String cost) {
        if (cost == null || cost.isBlank()) return;
        String trimmed = cost.trim().replace(",", "");
        try {
            map.put("pfmcalender_cost", Integer.parseInt(trimmed));
        } catch (NumberFormatException e) {
            map.put("pfmcalender_cost", cost); // 숫자 아님 → 문자열로 저장
        }
    }

    /* =============== 조회 =============== */

    public List<PfmCalendarDTO> getAllEventsForMe(String authHeader) throws Exception {
        String userId = getUserIdByToken(authHeader);
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
        String userId = getUserIdByToken(authHeader);
        if (userId == null) return null;

        DocumentSnapshot doc = firestore.collection(RECORD_COLLECTION).document(id).get().get();
        if (!doc.exists()) return null;
        if (!isOwnerOrDevBypass(userId, doc, extractToken(authHeader))) return null;
        return mapDocToDto(doc);
    }

    /* =============== 생성 (multipart – 프론트 Addrecord와 매칭) =============== */

    public String addMyEvent(String authHeader,
                             String name, String date, String time, String location,
                             String seat, String cast, String cost, String memo, String bookingsite,
                             MultipartFile posterFile) throws Exception {

        String userId = getUserIdByToken(authHeader);
        if (userId == null) throw new IllegalStateException("사용자 식별 실패");

        Map<String, Object> data = new HashMap<>();
        data.put("userDocumentId", userId);
        data.put("pfmcalender_nm", name);
        data.put("pfmcalender_date", date);
        if (time != null) data.put("pfmcalender_time", time);

        if (location != null) {
            data.put("pfmcalender_place", location);
            data.put("pfmcalender_location", location); // 호환용
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
        return ref.getId();
    }

    /* =============== 생성 (간단 JSON – 필요시 사용) =============== */

    public String addMyEventJson(String authHeader, PfmCalendarUpdateRequest req) throws Exception {
        String userId = getUserIdByToken(authHeader);
        if (userId == null) throw new IllegalStateException("사용자 식별 실패");

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
        return ref.getId();
    }

    /* =============== 수정 (PUT JSON – 프론트 Modifyrecord와 매칭) =============== */

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
        String token  = extractToken(authHeader);
        String userId = getUserIdByToken(authHeader);
        if (userId == null) return "forbidden";

        DocumentReference ref = firestore.collection(RECORD_COLLECTION).document(id);
        DocumentSnapshot doc = ref.get().get();
        if (!doc.exists()) return "not_found";
        if (!isOwnerOrDevBypass(userId, doc, token)) return "forbidden";

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
        return "updated";
    }

    /* =============== 삭제 =============== */

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
        String token  = extractToken(authHeader);
        String userId = getUserIdByToken(authHeader);
        if (userId == null) return "forbidden";

        DocumentReference ref = firestore.collection(RECORD_COLLECTION).document(id);
        DocumentSnapshot doc = ref.get().get();
        if (!doc.exists()) return "not_found";
        if (!isOwnerOrDevBypass(userId, doc, token)) return "forbidden";

        ref.delete().get();
        return "deleted";
    }
}

