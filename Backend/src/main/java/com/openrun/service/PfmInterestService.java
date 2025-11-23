package com.openrun.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
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
                System.out.println("사용자 문서가 없습니다.");
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

    // null/빈값 제거 + 최대 크기 유지용(우선순위 리스트가 3개 제한이라면)
    private List<String> compactAndLimit(List<String> list, int maxSize) {
        if (list == null) return new ArrayList<>();
        List<String> compacted = new ArrayList<>();
        for (String id : list) {
            if (id != null && !id.isBlank()) compacted.add(id);
        }
        if (compacted.size() > maxSize) {
            return new ArrayList<>(compacted.subList(0, maxSize));
        }
        return compacted;
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

                List<String> likeList = (List<String>) snapshot.get("userLikeList");
                if (likeList == null) likeList = new ArrayList<>();

                List<String> priorityList = (List<String>) snapshot.get("userPriorityLikeList");
                if (priorityList == null) priorityList = new ArrayList<>();

                boolean isCurrentlyLiked = likeList.contains(pfmId);

                if (isCurrentlyLiked) {
                    // 관심 해제: 두 리스트 모두에서 제거
                    likeList.removeIf(id -> Objects.equals(id, pfmId));
                    priorityList.removeIf(id -> Objects.equals(id, pfmId));
                    priorityList = compactAndLimit(priorityList, 3);

                    Map<String, Object> updates = new HashMap<>();
                    updates.put("userLikeList", likeList);
                    updates.put("userPriorityLikeList", priorityList);
                    transaction.update(userDoc, updates);

                    System.out.println("관심 공연 해제: " + pfmId);
                } else {
                    // 관심 추가: likeList에만 추가(우선순위는 별도 로직에서 관리)
                    likeList.add(pfmId);
                    transaction.update(userDoc, "userLikeList", likeList);

                    System.out.println("관심 공연 추가: " + pfmId);
                }

                return null;
            });

        } catch (Exception e) {
            System.err.println("트랜잭션 오류: " + e.getMessage());
            e.printStackTrace();
        }
    }
}