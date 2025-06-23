package com.openrun.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.openrun.dto.PfmSearchDto;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Service
public class PfmSearchService {

    private final Firestore firestore;

    public PfmSearchService(Firestore firestore) {
        this.firestore = firestore;
    }

    public List<PfmSearchDto> searchPerformances(String query) throws ExecutionException, InterruptedException {
        List<PfmSearchDto> results = new ArrayList<>();

        CollectionReference colRef = firestore.collection("Kopis_performances_detail");

        // Firestore는 대소문자 구분 및 정규식 미지원이므로 유사 검색 시 \uf8ff 활용
        ApiFuture<QuerySnapshot> future = colRef
                .whereGreaterThanOrEqualTo("prfnm", query)
                .whereLessThanOrEqualTo("prfnm", query + "\uf8ff")
                .get();

        List<QueryDocumentSnapshot> docs = future.get().getDocuments();

        for (DocumentSnapshot doc : docs) {
            PfmSearchDto dto = doc.toObject(PfmSearchDto.class);
            if (dto != null) {
                dto.setPfm_doc_id(doc.getId()); // 문서 ID 삽입
                results.add(dto);
            }
        }

        return results;
    }
}