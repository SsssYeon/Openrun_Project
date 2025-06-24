package com.openrun.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.cloud.FirestoreClient;
import com.openrun.dto.LoginRequest;
import com.openrun.dto.SignupRequest;
import org.springframework.stereotype.Service;

import java.util.*;

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
            System.err.println("Firebase 오류: " + e.getMessage());
            return false;  // 또는 throw로 에러 응답을 프론트에 알려줘도 됨
        }
    }


    public Map<String, String> login(LoginRequest request) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        CollectionReference users = db.collection("UserData");

        Query query = users.whereEqualTo("userId", request.getUserId());
        ApiFuture<QuerySnapshot> querySnapshot = query.get();

        List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();
        if (documents.isEmpty()) {
            throw new Exception("존재하지 않는 사용자입니다.");
        }

        DocumentSnapshot userDoc = documents.get(0);
        String savedPassword = userDoc.getString("userPw");

        if (!Objects.equals(savedPassword, request.getUserPw())) {
            throw new Exception("비밀번호가 일치하지 않습니다.");
        }

        // 로그인 성공 시 사용자 정보 반환
        Map<String, String> result = new HashMap<>();
        result.put("user_local_token", "dummy_token"); // 실제로는 JWT 발급하는 식으로 개선 가능
        result.put("user_nicknm", userDoc.getString("userNickname"));
        return result;
    }
}