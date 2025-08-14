package com.openrun.service;

import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ExecutionException;

@Service
public class UserLikePfmDetailService {

    private final Firestore firestore;

    public UserLikePfmDetailService(Firestore firestore) {
        this.firestore = firestore;
    }

    public Map<String, Object> getPerformanceDetail(String mt20id) throws ExecutionException, InterruptedException {
        DocumentReference pfmRef = firestore.collection("Kopis_performances_detail").document(mt20id);
        DocumentSnapshot snapshot = pfmRef.get().get();

        if (!snapshot.exists()) return null;

        return snapshot.getData(); // Map<String, Object> 그대로 반환
    }
}
