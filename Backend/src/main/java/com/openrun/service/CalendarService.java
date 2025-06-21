package com.openrun.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import com.openrun.dto.CalendarEvent;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Service
public class CalendarService {

    private static final String COLLECTION_NAME = "calendarEvents";

    public List<CalendarEvent> getAllEvents() throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        ApiFuture<QuerySnapshot> future = db.collection(COLLECTION_NAME).get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();

        List<CalendarEvent> events = new ArrayList<>();
        for (QueryDocumentSnapshot doc : documents) {
            CalendarEvent event = doc.toObject(CalendarEvent.class);
            event.setId(doc.getId());
            events.add(event);
        }
        return events;
    }

    public String addEvent(CalendarEvent event) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        ApiFuture<DocumentReference> addedDocRef = db.collection(COLLECTION_NAME).add(event);
        return addedDocRef.get().getId();
    }
}
