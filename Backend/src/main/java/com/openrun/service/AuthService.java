package com.openrun.service;

import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.UserRecord;
import com.openrun.dto.ChangePasswordRequest;
import com.openrun.dto.DeleteAccountRequest;
import com.openrun.dto.LoginRequest;
import com.openrun.dto.SignupRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ExecutionException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String USER_COLLECTION = "UserData";

    private final Firestore firestore;       // FirebaseConfig에서 @Bean 주입
    private final FirebaseAuth firebaseAuth; // FirebaseConfig에서 @Bean 주입

    private final HttpSession session;       // 필요 없으면 제거 가능

    /* =============== 회원가입 =============== */
    public void signup(SignupRequest request) throws Exception {
        try {
            // 1) Firebase Authentication 계정 생성 (email은 내부용 가짜 도메인)
            UserRecord.CreateRequest createRequest = new UserRecord.CreateRequest()
                    .setEmail(request.getUser_id() + "@openrun.temp")
                    .setPassword(request.getUser_pw());
            UserRecord userRecord = firebaseAuth.createUser(createRequest);
            String uid = userRecord.getUid();

            // 2) Firestore 사용자 문서 생성 (문서ID = uid)
            DocumentReference docRef = firestore.collection(USER_COLLECTION).document(uid);

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
            throw new Exception("회원가입 처리 중 오류 발생: " + e.getMessage(), e);
        }
    }

    /* =============== ID(=userId) 중복 확인 =============== */
    public boolean isEmailDuplicate(String userId) throws ExecutionException, InterruptedException {
        CollectionReference users = firestore.collection(USER_COLLECTION);
        QuerySnapshot snapshot = users.whereEqualTo("userId", userId).get().get();
        return !snapshot.isEmpty();
    }

    /* =============== 로그인 (로컬 토큰 발급) =============== */
    public Map<String, Object> login(LoginRequest request) throws Exception {
        CollectionReference users = firestore.collection(USER_COLLECTION);

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

    /* =============== 자동 로그인 =============== */
    public Map<String, Object> autoLogin(String token) throws Exception {
        CollectionReference users = firestore.collection(USER_COLLECTION);

        List<QueryDocumentSnapshot> documents = users
                .whereEqualTo("userAutoLoginToken", token)
                .get().get().getDocuments();

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

    /* =============== 로그아웃(토큰 무효화) =============== */
    public ResponseEntity<String> logout(String userId) throws Exception {
        CollectionReference users = firestore.collection(USER_COLLECTION);

        List<QueryDocumentSnapshot> documents = users
                .whereEqualTo("userId", userId) // 필드명 일치
                .get().get().getDocuments();

        if (documents.isEmpty()) {
            return ResponseEntity.badRequest().body("존재하지 않는 사용자입니다.");
        }

        DocumentReference userDoc = documents.get(0).getReference();
        userDoc.update("userAutoLoginToken", null).get(); // 토큰 초기화

        return ResponseEntity.ok("로그아웃이 완료되었습니다.");
    }

    /* =============== 아이디 찾기 =============== */
    public String findUserId(String userName, String userPhoneNumber) throws Exception {
        CollectionReference users = firestore.collection(USER_COLLECTION);

        List<QueryDocumentSnapshot> documents = users
                .whereEqualTo("userName", userName)
                .whereEqualTo("userPhoneNumber", userPhoneNumber)
                .get().get().getDocuments();

        if (documents.isEmpty()) throw new Exception("해당 정보와 일치하는 사용자가 없습니다.");

        return documents.get(0).getString("userId");
    }

    /* =============== 비밀번호 초기화(임시 비번 발급) =============== */
    public String resetPassword(String userId, String userPhoneNumber) throws Exception {
        CollectionReference users = firestore.collection(USER_COLLECTION);

        List<QueryDocumentSnapshot> documents = users
                .whereEqualTo("userId", userId)
                .whereEqualTo("userPhoneNumber", userPhoneNumber)
                .get().get().getDocuments();

        if (documents.isEmpty()) throw new Exception("입력한 정보와 일치하는 사용자가 없습니다.");

        DocumentSnapshot userDoc = documents.get(0);
        String uid = userDoc.getId();
        String tempPassword = UUID.randomUUID().toString().substring(0, 8);

        // FirebaseAuth 비밀번호 업데이트
        firebaseAuth.updateUser(new UserRecord.UpdateRequest(uid).setPassword(tempPassword));

        // Firestore 비밀번호 업데이트
        userDoc.getReference().update("userPw", tempPassword).get();

        return tempPassword;
    }

    /* =============== 비밀번호 변경 =============== */
    public String changePassword(ChangePasswordRequest request) throws Exception {
        CollectionReference users = firestore.collection(USER_COLLECTION);

        List<QueryDocumentSnapshot> documents = users
                .whereEqualTo("userId", request.getUser_id())
                .whereEqualTo("userPw", request.getCurrentPassword())
                .get().get().getDocuments();

        if (documents.isEmpty()) throw new Exception("현재 비밀번호가 일치하지 않습니다.");

        DocumentSnapshot userDoc = documents.get(0);
        String uid = userDoc.getId();

        // FirebaseAuth 비밀번호 업데이트
        firebaseAuth.updateUser(new UserRecord.UpdateRequest(uid).setPassword(request.getNewPassword()));

        // Firestore 비밀번호 업데이트
        userDoc.getReference().update("userPw", request.getNewPassword()).get();

        return "비밀번호가 성공적으로 변경되었습니다.";
    }

    /* =============== 회원 탈퇴 =============== */
    public String deleteAccount(DeleteAccountRequest request) throws Exception {
        CollectionReference users = firestore.collection(USER_COLLECTION);

        List<QueryDocumentSnapshot> documents = users
                .whereEqualTo("userId", request.getUser_id())
                .whereEqualTo("userPw", request.getPassword())
                .get().get().getDocuments();

        if (documents.isEmpty()) throw new Exception("아이디 또는 비밀번호가 잘못되었습니다.");

        DocumentSnapshot userDoc = documents.get(0);
        String uid = userDoc.getId();

        // 1) FirebaseAuth 계정 삭제
        firebaseAuth.deleteUser(uid);

        // 2) Firestore 문서 정리
        userDoc.getReference().update("userAutoLoginToken", null).get();
        userDoc.getReference().delete().get();

        // 3) 세션 무효화 (세션 사용 시)
        if (session != null) session.invalidate();

        return "회원 탈퇴가 완료되었습니다. 모든 로그인 정보가 삭제되었습니다.";
    }
}