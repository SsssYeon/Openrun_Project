// src/main/java/com/openrun/service/UserMainFavoriteService.java
package com.openrun.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.openrun.dto.ApiResponse;
import lombok.RequiredArgsConstructor; import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.*; import java.util.concurrent.ExecutionException;

@Service @RequiredArgsConstructor @Slf4j
public class UserMainFavoriteService {
    private static final String USER_COLLECTION = "UserData";
    private static final String FIELD_PRIORITY = "userPriorityLikeList";
    private static final String FIELD_TOKEN = "userAutoLoginToken";
    private final Firestore firestore;

    private String extractToken(String h){ if(h==null||h.isBlank()) return null; return h.startsWith("Bearer ")?h.substring(7).trim():h.trim(); }
    private String getUserDocIdByToken(String auth) throws ExecutionException,InterruptedException{
        String token = extractToken(auth); if(token==null||token.isBlank()) return null;
        QuerySnapshot qs = firestore.collection(USER_COLLECTION).whereEqualTo(FIELD_TOKEN, token).limit(1).get().get();
        return qs.isEmpty()?null:qs.getDocuments().get(0).getId();
    }

    public ApiResponse<List<String>> addMainFavorite(String auth, String pfmDocId) throws Exception {
        if (pfmDocId==null||pfmDocId.isBlank()) return new ApiResponse<>(false,"pfm_doc_id 누락됨",null);
        String userDocId = getUserDocIdByToken(auth);
        if (userDocId==null) return new ApiResponse<>(false,"유효하지 않은 토큰",null);

        DocumentReference ref = firestore.collection(USER_COLLECTION).document(userDocId);

        List<String> updated = firestore.runTransaction(tx -> {
            ApiFuture<DocumentSnapshot> future = tx.get(ref);
            DocumentSnapshot snap = future.get();

            List<String> list;
            if (!snap.exists()) {
                list = new ArrayList<>();
            } else {
                @SuppressWarnings("unchecked")
                List<String> current = (List<String>) snap.get(FIELD_PRIORITY);
                list = (current == null) ? new ArrayList<>() : new ArrayList<>(current);
            }

            if (!list.contains(pfmDocId)) {
                if (list.size()>=3) throw new IllegalStateException("달력 노출 공연은 최대 3개까지만 설정 가능");
                list.add(pfmDocId);
            }

            Map<String, Object> data = new HashMap<>();
            data.put(FIELD_PRIORITY, list);
            tx.set(ref, data, SetOptions.merge());
            return list;
        }).get();

        return new ApiResponse<>(true,"추가 완료",updated);
    }

    public ApiResponse<List<String>> removeMainFavorite(String auth, String pfmDocId) throws Exception {
        if (pfmDocId==null||pfmDocId.isBlank()) return new ApiResponse<>(false,"pfm_doc_id 누락됨",null);
        String userDocId = getUserDocIdByToken(auth);
        if (userDocId==null) return new ApiResponse<>(false,"유효하지 않은 토큰",null);

        DocumentReference ref = firestore.collection(USER_COLLECTION).document(userDocId);

        List<String> updated = firestore.runTransaction(tx -> {
            ApiFuture<DocumentSnapshot> future = tx.get(ref);
            DocumentSnapshot snap = future.get();

            List<String> list;
            if (!snap.exists()) {
                list = new ArrayList<>();
            } else {
                @SuppressWarnings("unchecked")
                List<String> current = (List<String>) snap.get(FIELD_PRIORITY);
                list = (current == null) ? new ArrayList<>() : new ArrayList<>(current);
            }

            list.removeIf(pfmDocId::equals);

            Map<String, Object> data = new HashMap<>();
            data.put(FIELD_PRIORITY, list);
            tx.set(ref, data, SetOptions.merge());
            return list;
        }).get();

        return new ApiResponse<>(true,"삭제 완료",updated);
    }
}
