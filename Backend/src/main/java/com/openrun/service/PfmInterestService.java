package com.openrun.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ExecutionException;

@Service
public class PfmInterestService {

    private static final String COLLECTION_NAME = "UserData";

    private final Firestore firestore;

    public PfmInterestService(Firestore firestore) {
        this.firestore = firestore;
    }

    private DocumentReference getUserDocumentByToken(String token) throws ExecutionException, InterruptedException {
        CollectionReference users = firestore.collection(COLLECTION_NAME);
        Query query = users.whereEqualTo("userAutoLoginToken", token);
        ApiFuture<QuerySnapshot> future = query.get();
        QuerySnapshot querySnapshot = future.get();

        if (querySnapshot.isEmpty()) return null;

        return querySnapshot.getDocuments().get(0).getReference();
    }


    public boolean isLiked(String token, String pfmId) {
        try {
            DocumentReference userDoc = getUserDocumentByToken(token);
            if (userDoc == null) {
                System.out.println("❌ 사용자 문서가 없습니다.");
                return false;
            }

            DocumentSnapshot snapshot = userDoc.get().get();
            List<String> likeList = (List<String>) snapshot.get("userLikeList");
            return likeList != null && likeList.contains(pfmId);

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }


    public void toggleInterest(String token, String pfmId) {
        try {
            DocumentReference userDoc = getUserDocumentByToken(token);
            if (userDoc == null) {
                System.out.println("사용자 문서가 없습니다.");
                return;
            }

            firestore.runTransaction(transaction -> {
                DocumentSnapshot snapshot = transaction.get(userDoc).get();

                List<String> list = (List<String>) snapshot.get("userLikeList");
                if (list == null) list = new ArrayList<>();

                if (list.contains(pfmId)) {
                    list.remove(pfmId); // 공연 ID 제거
                    System.out.println("💔 관심 공연 해제: " + pfmId);
                } else {
                    list.add(pfmId); // 뒤에 추가 → "먼저 추가한 순서대로 인덱스" 유지
                    System.out.println("❤️ 관심 공연 추가: " + pfmId);
                }

                transaction.update(userDoc, "userLikeList", list);
                System.out.println("📄 관심 공연 리스트 최종: " + list);
                return null;
            });

        } catch (Exception e) {
            System.err.println("🔥 트랜잭션 오류: " + e.getMessage());
            e.printStackTrace();
        }
    }
}