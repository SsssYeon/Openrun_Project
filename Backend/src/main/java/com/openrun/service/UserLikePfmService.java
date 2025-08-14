package com.openrun.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ExecutionException;

@Service
public class UserLikePfmService {

    private final Firestore firestore = FirestoreClient.getFirestore();

    // 관심공연 목록 조회
    public List<Map<String, Object>> getUserFavorites(String token) throws Exception {
        // 1. 토큰으로 유저 찾기
        CollectionReference usersRef = firestore.collection("UserData");
        QuerySnapshot userSnap = usersRef.whereEqualTo("userAutoLoginToken", token).get().get();

        if (userSnap.isEmpty()) throw new Exception("사용자를 찾을 수 없습니다.");
        DocumentSnapshot userDoc = userSnap.getDocuments().get(0);

        // 2. userLikeList 가져오기
        List<String> likedIds = (List<String>) userDoc.get("userLikeList");
        if (likedIds == null) likedIds = new ArrayList<>();

        // 3. 관심공연 정보 가져오기
        List<Map<String, Object>> result = new ArrayList<>();
        CollectionReference pfmRef = firestore.collection("Kopis_performances_detail");

        for (String mt20id : likedIds) {
            QuerySnapshot pfmSnap = pfmRef.whereEqualTo("mt20id", mt20id).get().get();
            if (!pfmSnap.isEmpty()) {
                DocumentSnapshot pfmDoc = pfmSnap.getDocuments().get(0);
                Map<String, Object> show = new HashMap<>();
                show.put("pfm_doc_id", pfmDoc.getId()); // 문서 ID
                show.put("poster", pfmDoc.getString("poster"));
                show.put("title", pfmDoc.getString("prfnm"));
                result.add(show);
            }
        }
        return result;
    }

    // 공연 상세 정보 조회
    public Map<String, Object> getPerformanceDetail(String pfmDocId) throws Exception {
        DocumentReference docRef = firestore.collection("Kopis_performances_detail").document(pfmDocId);
        DocumentSnapshot docSnap = docRef.get().get();

        if (!docSnap.exists()) throw new Exception("공연 정보를 찾을 수 없습니다.");

        Map<String, Object> detail = new HashMap<>();
        detail.put("poster", docSnap.getString("poster"));
        detail.put("title", docSnap.getString("prfnm"));
        detail.put("theater", docSnap.getString("fcltynm"));
        detail.put("cast", docSnap.getString("prfcast"));
        detail.put("runningTime", docSnap.getString("prfruntime"));
        detail.put("age", docSnap.getString("prfage"));
        detail.put("producer", docSnap.getString("entrpsnmS"));
        detail.put("genre", docSnap.getString("genrenm"));
        detail.put("schedule", docSnap.getString("dtguidance"));
        detail.put("ticketPrice", docSnap.getString("pcseguidance"));
        detail.put("story", docSnap.getString("sty"));

        return detail;
    }
}
