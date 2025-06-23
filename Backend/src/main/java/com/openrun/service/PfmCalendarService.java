package com.openrun.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.openrun.dto.PfmCalendarDTO;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Service
public class PfmCalendarService {

    private final Firestore firestore;

    public PfmCalendarService(Firestore firestore) {
        this.firestore = firestore;
    }

    // 전체 관극 기록 조회
    public List<PfmCalendarDTO> getAllEvents() throws ExecutionException, InterruptedException {
        List<PfmCalendarDTO> events = new ArrayList<>();
        CollectionReference colRef = firestore.collection("Calendar_me");

        ApiFuture<QuerySnapshot> future = colRef.get();
        List<QueryDocumentSnapshot> docs = future.get().getDocuments();

        for (DocumentSnapshot doc : docs) {
            PfmCalendarDTO dto = doc.toObject(PfmCalendarDTO.class);
            if (dto != null) {
                dto.setPfmcalender_doc_no(doc.getId()); // 문서 ID를 직접 DTO에 추가
                events.add(dto);
            }
        }

        return events;
    }

    // 특정 ID로 관극 기록 하나 조회
    public PfmCalendarDTO getEventById(String id) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection("Calendar_me").document(id);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot doc = future.get();

        if (doc.exists()) {
            PfmCalendarDTO dto = doc.toObject(PfmCalendarDTO.class);
            if (dto != null) {
                dto.setPfmcalender_doc_no(doc.getId()); // Firestore 문서 ID도 함께 DTO에 포함
            }
            return dto;
        } else {
            return null;
        }
    }
}