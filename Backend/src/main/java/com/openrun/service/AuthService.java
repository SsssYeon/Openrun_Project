package com.openrun.service;

import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.cloud.FirestoreClient;
import com.openrun.dto.SignupRequest;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {
    public void signup(SignupRequest request) throws Exception {
        // Firebase Auth에 사용자 생성
        UserRecord.CreateRequest createRequest = new UserRecord.CreateRequest()
                .setEmail(request.getEmail())
                .setPassword(request.getPassword());

        UserRecord userRecord = FirebaseAuth.getInstance().createUser(createRequest);

        // Firestore에 사용자 추가 정보 저장
        Firestore firestore = FirestoreClient.getFirestore();
        DocumentReference docRef = firestore.collection("users").document(userRecord.getUid());

        Map<String, Object> userData = new HashMap<>();
        userData.put("email", request.getEmail());
        userData.put("phone", request.getPhone());

        docRef.set(userData); // 저장 실행
    }

    public boolean isEmailDuplicate(String email) {
        try {
            FirebaseAuth.getInstance().getUserByEmail(email); // 조회 성공
            return true; // 이미 있는 사용자
        } catch (FirebaseAuthException e) {
            if ("USER_NOT_FOUND".equals(e.getErrorCode())) {
                return false; // 사용자 없음 = 중복 아님
            }
            // 👉 여기를 예외 던지지 말고, false 처리 or 로깅만!
            System.err.println("Firebase 오류: " + e.getMessage());
            return false;  // 또는 throw로 에러 응답을 프론트에 알려줘도 됨
        }
    }
}