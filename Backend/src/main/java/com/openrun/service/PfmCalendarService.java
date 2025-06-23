package com.openrun.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.Bucket;
import com.google.firebase.cloud.StorageClient;
import com.openrun.dto.PfmCalendarDTO;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
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

    // 관극 기록 저장
    public String addEvent(String name, String date, String time, String location, String seat,
                           String cast, String cost, String memo, MultipartFile posterFile) throws Exception {

        Map<String, Object> data = new HashMap<>();
        data.put("pfmcalender_nm", name);
        data.put("pfmcalender_date", date);
        if (time != null) data.put("pfmcalender_time", time);
        if (location != null) data.put("pfmcalender_location", location);
        if (seat != null) data.put("pfmcalender_seat", seat);
        if (cast != null) data.put("pfmcalender_today_cast", cast);
        if (cost != null) data.put("pfmcalender_cost", cost);
        if (memo != null) data.put("pfmcalender_memo", memo);

        if (posterFile != null && !posterFile.isEmpty()) {
            String fileName = UUID.randomUUID() + "_" + posterFile.getOriginalFilename();
            String imageUrl = uploadPosterImage(posterFile, fileName);
            data.put("pfmcalender_poster", imageUrl);
        }

        DocumentReference docRef = firestore.collection("Calendar_me").document();
        docRef.set(data);

        return docRef.getId();
    }


    public String updateEvent(String id,
                              String name,
                              String date,
                              String time,
                              String location,
                              String seat,
                              String cast,
                              String cost,
                              String memo,
                              MultipartFile posterFile) throws Exception {

        DocumentReference docRef = firestore.collection("Calendar_me").document(id);

        Map<String, Object> updateData = new HashMap<>();
        updateData.put("pfmcalender_nm", name);
        updateData.put("pfmcalender_date", date);
        if (time != null) updateData.put("pfmcalender_time", time);
        if (location != null) updateData.put("pfmcalender_location", location);
        if (seat != null) updateData.put("pfmcalender_seat", seat);
        if (cast != null) updateData.put("pfmcalender_today_cast", cast);
        if (cost != null) updateData.put("pfmcalender_cost", cost);
        if (memo != null) updateData.put("pfmcalender_memo", memo);

        if (posterFile != null && !posterFile.isEmpty()) {
            String fileName = UUID.randomUUID() + "_" + posterFile.getOriginalFilename();
            String imageUrl = uploadPosterImage(posterFile, fileName);
            updateData.put("pfmcalender_poster", imageUrl); // Firestore에 URL 저장
        }

        docRef.update(updateData);

        return "updated";
    }

    public String uploadPosterImage(MultipartFile file, String fileName) throws IOException {
        Bucket bucket = StorageClient.getInstance().bucket();

        String blobName = "posters/" + fileName;
        Blob blob = bucket.create(blobName, file.getBytes(), file.getContentType());

        // 올바른 Firebase Storage URL 생성
        return String.format("https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media",
                bucket.getName(), java.net.URLEncoder.encode(blob.getName(), "UTF-8"));
    }
}