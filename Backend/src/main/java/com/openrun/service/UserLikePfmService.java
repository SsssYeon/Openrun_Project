package com.openrun.service;

import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ExecutionException;

@Service
public class UserLikePfmService {

    private final Firestore firestore = FirestoreClient.getFirestore();

    // 로그인 토큰으로 해당 유저의 관심공연 리스트 조회
    public List<Map<String, Object>> getUserFavorites(String token) throws Exception {
        CollectionReference users = firestore.collection("UserData");
        QuerySnapshot snapshot = users.whereEqualTo("userAutoLoginToken", token).get().get();

        if (snapshot.getDocuments().isEmpty()) {
            throw new Exception("사용자를 찾을 수 없습니다.");
        }

        DocumentSnapshot userDoc = snapshot.getDocuments().get(0);
        Object listObj = userDoc.get("userLikeList");

        List<Map<String, Object>> favorites = new ArrayList<>();

        if (listObj instanceof List<?>) {
            for (Object item : (List<?>) listObj) {
                String mt20id;

                // 문자열 ID인 경우와 Map인 경우 구분
                if (item instanceof Map<?, ?>) {
                    mt20id = (String) ((Map<?, ?>) item).get("mt20id");
                } else {
                    mt20id = item.toString();
                }

                System.out.println("[DEBUG] 관심공연 ID 조회: " + mt20id);

                // 공연 상세 정보 가져오기
                Map<String, Object> detail = getPerformanceDetail(mt20id);
                if (detail != null) {
                    System.out.println("[DEBUG] 상세 정보 조회 성공: " + detail.get("prfnm"));
                    favorites.add(Map.of(
                            "id", mt20id,
                            "poster", detail.get("poster"),
                            "title", detail.get("prfnm")
                    ));
                } else {
                    System.out.println("[DEBUG] 상세 조회 결과 없음: " + mt20id);
                }
            }
        }

        System.out.println("[DEBUG] 최종 관심공연 리스트: " + favorites.size() + "개");
        return favorites;
    }


    // 공연 상세 정보 조회 (KOPIS 컬렉션 기준)
    public Map<String, Object> getPerformanceDetail(String mt20id) throws Exception {
        DocumentReference docRef = firestore.collection("Kopis_performances_detail").document(mt20id);
        DocumentSnapshot docSnap = docRef.get().get();
        if (!docSnap.exists()) {
            return null; // 존재하지 않으면 null 반환
        }

        return docSnap.getData();
    }
}
