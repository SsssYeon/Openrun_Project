package com.openrun.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.cloud.FirestoreClient;
import com.openrun.dto.ChangePasswordRequest;
import com.openrun.dto.DeleteAccountRequest;
import com.openrun.dto.LoginRequest;
import com.openrun.dto.SignupRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.*;
import java.util.concurrent.ExecutionException;

@Service
public class AuthService {


    private final Firestore firestore = FirestoreClient.getFirestore();
    @Autowired
    private HttpSession session;

    // 회원가입
    public void signup(SignupRequest request) throws Exception {
        try {
            UserRecord.CreateRequest createRequest = new UserRecord.CreateRequest()
                    .setEmail(request.getUser_id() + "@openrun.temp")
                    .setPassword(request.getUser_pw());

            UserRecord userRecord = FirebaseAuth.getInstance().createUser(createRequest);

            Firestore db = FirestoreClient.getFirestore();
            DocumentReference docRef = db.collection("UserData").document(userRecord.getUid());

            Map<String, Object> userData = new HashMap<>();
            userData.put("userId", request.getUser_id());
            userData.put("userPw", request.getUser_pw());
            userData.put("userName", request.getUser_nm());
            userData.put("userNickname", request.getUser_nicknm());
            userData.put("userPhoneNumber", request.getUser_phonenum());
            userData.put("userAutoLoginToken", "");
            userData.put("userKakaoToken", "");
            userData.put("userLikeList", new ArrayList<String>());
            userData.put("userPrivacyPolicyAgree", 0);
            userData.put("userState", 1);
            userData.put("userTimeStamp", Timestamp.now());

            docRef.set(userData).get();
        } catch (Exception e) {
            e.printStackTrace();
            throw new Exception("회원가입 처리 중 오류 발생: " + e.getMessage());
        }
    }

    // ID 중복 확인
    public boolean isEmailDuplicate(String userId) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        CollectionReference users = db.collection("UserData");

        QuerySnapshot snapshot = users.whereEqualTo("userId", userId).get().get();
        return !snapshot.isEmpty();
    }

    // 로그인
    public Map<String, Object> login(LoginRequest request) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        CollectionReference users = db.collection("UserData");

        List<QueryDocumentSnapshot> documents = users
                .whereEqualTo("userId", request.getUser_id())
                .get().get().getDocuments();

        if (documents.isEmpty()) throw new Exception("존재하지 않는 사용자입니다.");

        DocumentSnapshot userDoc = documents.get(0);
        String savedPassword = userDoc.getString("userPw"); // DB 필드명 userPw

        if (!Objects.equals(savedPassword, request.getUser_pw())) {
            throw new Exception("비밀번호가 일치하지 않습니다.");
        }

        // 토큰 생성 및 DB 업데이트
        String autoLoginToken = UUID.randomUUID().toString();
        userDoc.getReference().update("userAutoLoginToken", autoLoginToken).get();

        // 프론트 기준 반환 데이터
        Map<String, Object> result = new HashMap<>();
        result.put("user_local_token", autoLoginToken);
        result.put("user_nicknm", userDoc.getString("userNickname"));
        result.put("user_id", userDoc.getString("userId"));
        result.put("user_nm", userDoc.getString("userName"));
        result.put("user_phonenum", userDoc.getString("userPhoneNumber"));

        return result;
    }

    // 자동 로그인
    public Map<String, Object> autoLogin(String token) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        CollectionReference users = db.collection("UserData");

        Query query = users.whereEqualTo("userAutoLoginToken", token);
        List<QueryDocumentSnapshot> documents = query.get().get().getDocuments();
        if (documents.isEmpty()) throw new Exception("유효하지 않은 자동 로그인 토큰입니다.");

        DocumentSnapshot userDoc = documents.get(0);

        Map<String, Object> result = new HashMap<>();
        result.put("user_local_token", token);
        result.put("user_nicknm", userDoc.getString("userNickname"));
        result.put("user_id", userDoc.getString("userId"));
        result.put("user_nm", userDoc.getString("userName"));
        result.put("user_phonenum", userDoc.getString("userPhoneNumber"));

        return result;
    }

    // 로그아웃
    public ResponseEntity<String> logout(String userId) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        CollectionReference users = db.collection("UserData");

        Query query = users.whereEqualTo("user_id", userId);
        ApiFuture<QuerySnapshot> querySnapshot = query.get();
        QuerySnapshot snapshot = querySnapshot.get();
        List<QueryDocumentSnapshot> documents = snapshot.getDocuments();

        if (documents.isEmpty()) {
            return ResponseEntity.badRequest().body("존재하지 않는 사용자입니다.");
        }

        DocumentReference userDoc = documents.get(0).getReference();
        userDoc.update("user_local_token", null).get(); // 토큰 초기화

        return ResponseEntity.ok("로그아웃이 완료되었습니다.");
    }

    //아이디 찾기
    public String findUserId(String userName, String userPhoneNumber) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        CollectionReference users = db.collection("UserData");

        Query query = users.whereEqualTo("userName", userName)
                .whereEqualTo("userPhoneNumber", userPhoneNumber);
        List<QueryDocumentSnapshot> documents = query.get().get().getDocuments();

        if (documents.isEmpty()) {
            throw new Exception("해당 정보와 일치하는 사용자가 없습니다.");
        }

        return documents.get(0).getString("userId"); // DB 기준 필드명
    }

    //비밀번호 초기화
    public String resetPassword(String userId, String userName, String userPhoneNumber) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        CollectionReference users = db.collection("UserData");

        Query query = users.whereEqualTo("userId", userId)
                .whereEqualTo("userName", userName)
                .whereEqualTo("userPhoneNumber", userPhoneNumber);
        List<QueryDocumentSnapshot> documents = query.get().get().getDocuments();

        if (documents.isEmpty()) {
            throw new Exception("입력한 정보와 일치하는 사용자가 없습니다.");
        }

        DocumentSnapshot userDoc = documents.get(0);
        String uid = userDoc.getId();
        String tempPassword = UUID.randomUUID().toString().substring(0, 8);

        // FirebaseAuth 비밀번호 업데이트
        UserRecord.UpdateRequest request = new UserRecord.UpdateRequest(uid)
                .setPassword(tempPassword);
        FirebaseAuth.getInstance().updateUser(request);

        // Firestore 비밀번호 업데이트
        userDoc.getReference().update("userPw", tempPassword).get();

        return tempPassword;
    }

    // 비밀번호 변경
    public String changePassword(ChangePasswordRequest request) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        CollectionReference users = db.collection("UserData");

        Query query = users.whereEqualTo("userId", request.getUser_id())
                .whereEqualTo("userPw", request.getCurrentPassword());
        List<QueryDocumentSnapshot> documents = query.get().get().getDocuments();

        if (documents.isEmpty()) throw new Exception("현재 비밀번호가 일치하지 않습니다.");

        documents.get(0).getReference().update("userPw", request.getNewPassword()).get();
        return "비밀번호가 성공적으로 변경되었습니다.";
    }

    // 회원 탈퇴
    public String deleteAccount(DeleteAccountRequest request) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        CollectionReference users = db.collection("UserData");

        Query query = users.whereEqualTo("userId", request.getUser_id())
                .whereEqualTo("userPw", request.getPassword());
        List<QueryDocumentSnapshot> documents = query.get().get().getDocuments();

        if (documents.isEmpty()) throw new Exception("아이디 또는 비밀번호가 잘못되었습니다.");

        DocumentReference userDoc = documents.get(0).getReference();
        userDoc.update("userAutoLoginToken", null).get();
        userDoc.delete().get();

        session.invalidate();
        return "회원 탈퇴가 완료되었습니다. 모든 로그인 정보가 삭제되었습니다.";
    }
}
