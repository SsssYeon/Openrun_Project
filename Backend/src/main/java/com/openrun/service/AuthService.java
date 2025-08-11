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
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AuthService {

    public void signup(SignupRequest request) throws Exception {
        try {
            UserRecord.CreateRequest createRequest = new UserRecord.CreateRequest()
                    .setEmail(request.getUser_id() + "@openrun.temp") // 임시 이메일 생성
                    .setPassword(request.getUser_pw());

            UserRecord userRecord = FirebaseAuth.getInstance().createUser(createRequest);

            Firestore firestore = FirestoreClient.getFirestore();
            DocumentReference docRef = firestore.collection("UserData").document(userRecord.getUid());

            Map<String, Object> userData = new HashMap<>();
            userData.put("user_doc_no", 0);  // 자동증가 필요하면 별도 구현
            userData.put("user_id", request.getUser_id());
            userData.put("user_pw", request.getUser_pw());
            userData.put("user_nm", request.getUser_nm());
            userData.put("user_nicknm", request.getUser_nicknm());
            userData.put("user_phonenum", request.getUser_phonenum());
            userData.put("user_local_token", "");
            userData.put("user_kakao_token", "");
            userData.put("user_timestamp", Timestamp.now());

            docRef.set(userData).get();

        } catch (Exception e) {
            e.printStackTrace();
            throw new Exception("회원가입 처리 중 오류 발생: " + e.getMessage());
        }
    }

    public boolean isEmailDuplicate(String userId) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        CollectionReference users = db.collection("UserData");

        QuerySnapshot snapshot = users.whereEqualTo("user_id", userId).get().get();

        return !snapshot.isEmpty();
    }

    public Map<String, String> login(LoginRequest request) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        CollectionReference users = db.collection("UserData");

        Query query = users.whereEqualTo("user_id", request.getUser_id());
        ApiFuture<QuerySnapshot> querySnapshot = query.get();

        List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();
        if (documents.isEmpty()) {
            throw new Exception("존재하지 않는 사용자입니다.");
        }

        DocumentSnapshot userDoc = documents.get(0);
        String savedPassword = userDoc.getString("user_pw");

        if (!Objects.equals(savedPassword, request.getUser_pw())) {
            throw new Exception("비밀번호가 일치하지 않습니다.");
        }

        String autoLoginToken = UUID.randomUUID().toString();

        DocumentReference userRef = userDoc.getReference();
        Map<String, Object> updateData = new HashMap<>();
        updateData.put("user_local_token", autoLoginToken);
        userRef.update(updateData).get();

        Map<String, String> result = new HashMap<>();
        result.put("user_local_token", autoLoginToken);
        result.put("user_nicknm", userDoc.getString("user_nicknm"));

        return result;
    }

    public Map<String, String> autoLogin(String token) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        CollectionReference users = db.collection("UserData");

        Query query = users.whereEqualTo("user_local_token", token);
        ApiFuture<QuerySnapshot> querySnapshot = query.get();

        List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();
        if (documents.isEmpty()) {
            throw new Exception("유효하지 않은 자동 로그인 토큰입니다.");
        }

        DocumentSnapshot userDoc = documents.get(0);

        Map<String, String> result = new HashMap<>();
        result.put("user_local_token", token);
        result.put("user_nicknm", userDoc.getString("user_nicknm"));
        result.put("user_id", userDoc.getString("user_id"));
        return result;
    }

    public String findUserId(String userName, String userPhoneNumber) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        CollectionReference users = db.collection("UserData");

        Query query = users
                .whereEqualTo("user_nm", userName)
                .whereEqualTo("user_phonenum", userPhoneNumber);
        ApiFuture<QuerySnapshot> querySnapshot = query.get();

        List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();
        if (documents.isEmpty()) {
            throw new Exception("해당 정보와 일치하는 사용자가 없습니다.");
        }

        DocumentSnapshot userDoc = documents.get(0);
        return userDoc.getString("user_id");
    }

    public String resetPassword(String userId, String userName, String userPhoneNumber) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        CollectionReference users = db.collection("UserData");

        Query query = users
                .whereEqualTo("user_id", userId)
                .whereEqualTo("user_nm", userName)
                .whereEqualTo("user_phonenum", userPhoneNumber);
        ApiFuture<QuerySnapshot> querySnapshot = query.get();

        List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();
        if (documents.isEmpty()) {
            throw new Exception("입력한 정보와 일치하는 사용자가 없습니다.");
        }

        DocumentSnapshot userDoc = documents.get(0);
        String uid = userDoc.getId();

        String tempPassword = UUID.randomUUID().toString().substring(0, 8);

        UserRecord.UpdateRequest request = new UserRecord.UpdateRequest(uid)
                .setPassword(tempPassword);
        FirebaseAuth.getInstance().updateUser(request);

        DocumentReference docRef = users.document(uid);
        Map<String, Object> updates = new HashMap<>();
        updates.put("user_pw", tempPassword);
        docRef.update(updates).get();

        return tempPassword;
    }

    public String changePassword(ChangePasswordRequest request) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        CollectionReference users = db.collection("UserData");

        Query query = users.whereEqualTo("user_id", request.getUser_id())
                .whereEqualTo("user_pw", request.getCurrentPassword());
        ApiFuture<QuerySnapshot> querySnapshot = query.get();
        List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();

        if (documents.isEmpty()) {
            throw new Exception("현재 비밀번호가 일치하지 않습니다.");
        }

        DocumentReference userDoc = documents.get(0).getReference();
        userDoc.update("user_pw", request.getNewPassword());

        return "비밀번호가 성공적으로 변경되었습니다.";
    }

    @Autowired
    private HttpSession session;

    public String deleteAccount(DeleteAccountRequest request) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        CollectionReference users = db.collection("UserData");

        Query query = users
                .whereEqualTo("user_id", request.getUser_id())
                .whereEqualTo("user_pw", request.getPassword());

        ApiFuture<QuerySnapshot> querySnapshot = query.get();
        List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();

        if (documents.isEmpty()) {
            throw new Exception("아이디 또는 비밀번호가 잘못되었습니다.");
        }

        DocumentReference userDoc = documents.get(0).getReference();
        userDoc.update("user_local_token", null);
        userDoc.delete().get();
        session.invalidate();

        return "회원 탈퇴가 완료되었습니다. 모든 로그인 정보가 삭제되었습니다.";
    }
}
