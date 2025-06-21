package com.openrun.service;

import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.DocumentReference;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.cloud.FirestoreClient;
import com.openrun.dto.SignupRequest;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {
    public void signup(SignupRequest request) throws Exception {
        // 1. Firebase Auth에 사용자 생성
        UserRecord.CreateRequest createRequest = new UserRecord.CreateRequest()
                .setEmail(request.getEmail())
                .setPassword(request.getPassword());

        UserRecord userRecord = FirebaseAuth.getInstance().createUser(createRequest);

        // 2. Firestore에 사용자 추가 정보 저장
        Firestore firestore = FirestoreClient.getFirestore();
        DocumentReference docRef = firestore.collection("users").document(userRecord.getUid());

        Map<String, Object> userData = new HashMap<>();
        userData.put("email", request.getEmail());
        userData.put("phone", request.getPhone());

        docRef.set(userData); // 저장 실행
    }
}