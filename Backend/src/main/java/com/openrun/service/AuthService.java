package com.openrun.service;

import com.google.cloud.Timestamp;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.cloud.FirestoreClient;
import com.openrun.dto.SignupRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AuthService {
    public void signup(SignupRequest request) throws Exception {
        try {
            UserRecord.CreateRequest createRequest = new UserRecord.CreateRequest()
                    .setEmail(request.getUser_id())
                    .setPassword(request.getUser_pw());

            UserRecord userRecord = FirebaseAuth.getInstance().createUser(createRequest);

            Firestore firestore = FirestoreClient.getFirestore();
            DocumentReference docRef = firestore.collection("UserData").document(userRecord.getUid());

            List<String> emptyLikeList = new ArrayList<>();

            Map<String, Object> userData = new HashMap<>();
            userData.put("userAutoLoginToken", "");
            userData.put("userId", request.getUser_id());
            userData.put("userPw", request.getUser_pw());
            userData.put("userName", request.getUser_nm());
            userData.put("userNickname", request.getUser_nicknm());
            userData.put("userPhoneNumber", request.getUser_phonenum());
            userData.put("userLikeList", emptyLikeList);
            userData.put("userPrivacyPolicyAgree", 1);
            userData.put("userState", 1);
            userData.put("userTimeStamp", Timestamp.now());

            docRef.set(userData).get();
        } catch (Exception e) {
            e.printStackTrace();  // 콘솔에 에러 스택 트레이스 출력
            throw new Exception("회원가입 처리 중 오류 발생: " + e.getMessage());
        }
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