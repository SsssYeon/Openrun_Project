package com.openrun.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import com.openrun.dto.PfmCalendarEvent;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Service
public class PfmCalendarService {

    private static final String COLLECTION_NAME = "Calendar_me";

    public List<PfmCalendarEvent> getAllEvents() throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        ApiFuture<QuerySnapshot> future = db.collection(COLLECTION_NAME).get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();

        List<PfmCalendarEvent> events = new ArrayList<>();
        for (QueryDocumentSnapshot doc : documents) {
            PfmCalendarEvent event = doc.toObject(PfmCalendarEvent.class);
            event.setPfmcalender_doc_no(doc.getId());  // Firestore 문서 ID → 고유값
            events.add(event);
        }

        return events;
    }
}