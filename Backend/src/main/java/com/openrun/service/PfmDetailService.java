package com.openrun.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.openrun.dto.PfmDetailDto;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@Service
public class PfmDetailService {

    private final Firestore firestore;

    public PfmDetailService(Firestore firestore) {
        this.firestore = firestore;
    }

    public PfmDetailDto getPerformanceDetail(String id) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection("Kopis_performances_detail").document(id);
        DocumentSnapshot doc = docRef.get().get();

        if (!doc.exists()) return null;

        PfmDetailDto dto = doc.toObject(PfmDetailDto.class);
        if (dto != null) dto.setPfm_doc_id(doc.getId());
        return dto;
    }

    /*
    public boolean isInterest(String userId, String performanceId) throws ExecutionException, InterruptedException {
        CollectionReference ref = firestore.collection("InterestCalendar");
        Query query = ref.whereEqualTo("user_id", userId)
                .whereEqualTo("likecalender_nm", performanceId);
        return !query.get().get().isEmpty();
    }

    public void addInterest(String userId, String performanceId, String timestamp) {
        firestore.collection("InterestCalendar").add(
                Map.of(
                        "user_id", userId,
                        "likecalender_nm", performanceId,
                        "likecalender_timestamp", timestamp
                )
        );
    }

    public void removeInterest(String userId, String performanceId) throws ExecutionException, InterruptedException {
        CollectionReference ref = firestore.collection("InterestCalendar");
        Query query = ref.whereEqualTo("user_id", userId)
                .whereEqualTo("likecalender_nm", performanceId);
        List<QueryDocumentSnapshot> docs = query.get().get().getDocuments();
        for (DocumentSnapshot doc : docs) {
            doc.getReference().delete();
        }
    }
     */
}