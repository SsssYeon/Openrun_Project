package com.openrun.controller;

import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import com.openrun.dto.ChangePasswordRequest;
import com.openrun.dto.DeleteAccountRequest;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private HttpSession session;

    //마이페이지
    @GetMapping("/me")
    public ResponseEntity<?> getMyInfo(@RequestParam("user_local_token") String token) {
        try {
            Firestore db = FirestoreClient.getFirestore();
            CollectionReference users = db.collection("UserData");

            // user_local_token으로 조회
            Query query = users.whereEqualTo("user_local_token", token);
            QuerySnapshot snapshot = query.get().get();

            if (snapshot.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "사용자를 찾을 수 없습니다."));
            }

            DocumentSnapshot userDoc = snapshot.getDocuments().get(0);

            Map<String, Object> userData = new HashMap<>();
            userData.put("user_id", userDoc.getString("user_id"));
            userData.put("user_nm", userDoc.getString("user_nm"));
            userData.put("user_nicknm", userDoc.getString("user_nicknm"));
            userData.put("user_phonenum", userDoc.getString("user_phonenum"));
            userData.put("user_local_token", userDoc.getString("user_local_token"));

            return ResponseEntity.ok(userData);
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "서버 오류가 발생했습니다."));
        }
    }

    //내 정보 수정 (닉네임, 전화번호 등)
    @PatchMapping("/me")
    public ResponseEntity<?> updateMyInfo(@RequestParam String user_id, @RequestBody Map<String, Object> updates) {
        try {
            Firestore db = FirestoreClient.getFirestore();
            CollectionReference users = db.collection("UserData");

            Query query = users.whereEqualTo("user_id", user_id);
            QuerySnapshot snapshot = query.get().get();

            if (snapshot.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "사용자를 찾을 수 없습니다."));
            }

            DocumentReference userDoc = snapshot.getDocuments().get(0).getReference();

            userDoc.update(updates).get();

            return ResponseEntity.ok(Map.of("message", "회원정보가 성공적으로 수정되었습니다."));
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "서버 오류가 발생했습니다."));
        }
    }

    //비밀번호 변경
    @PatchMapping("/me/password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        try {
            Firestore db = FirestoreClient.getFirestore();
            CollectionReference users = db.collection("UserData");

            Query query = users.whereEqualTo("user_id", request.getUser_id())
                    .whereEqualTo("user_pw", request.getCurrentPassword());
            QuerySnapshot snapshot = query.get().get();

            if (snapshot.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "현재 비밀번호가 일치하지 않습니다."));
            }

            DocumentReference userDoc = snapshot.getDocuments().get(0).getReference();
            userDoc.update("user_pw", request.getNewPassword()).get();

            return ResponseEntity.ok(Map.of("message", "비밀번호가 성공적으로 변경되었습니다."));
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "서버 오류가 발생했습니다."));
        }
    }

    //로그아웃
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletResponse response) {
        // 서버에서는 JWT를 저장하지 않으므로, 클라이언트에서 토큰을 삭제하도록 안내
        // 필요하면 쿠키에 JWT를 저장했다면 쿠키를 삭제
        Cookie cookie = new Cookie("token", null);
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0); // 즉시 만료
        cookie.setPath("/");
        response.addCookie(cookie);

        return ResponseEntity.ok("로그아웃 완료. 클라이언트에서 토큰을 삭제하세요.");
    }

    //회원 탈퇴
    @DeleteMapping("/me")
    public ResponseEntity<?> deleteAccount(@RequestBody DeleteAccountRequest request) {
        try {
            Firestore db = FirestoreClient.getFirestore();
            CollectionReference users = db.collection("UserData");

            Query query = users.whereEqualTo("user_id", request.getUser_id())
                    .whereEqualTo("user_pw", request.getPassword());
            QuerySnapshot snapshot = query.get().get();

            if (snapshot.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "아이디 또는 비밀번호가 잘못되었습니다."));
            }

            DocumentReference userDoc = snapshot.getDocuments().get(0).getReference();

            // 자동 로그인 토큰 삭제
            userDoc.update("user_local_token", null).get();

            // 회원 문서 삭제
            userDoc.delete().get();

            // 세션 무효화
            session.invalidate();

            return ResponseEntity.ok(Map.of("message", "회원 탈퇴가 완료되었습니다."));
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "서버 오류가 발생했습니다."));
        }
    }

    //내 관심 공연 목록 조회 (예시, 필요 시 필드명, 컬렉션명 조정)
    @GetMapping("/me/interests")
    public ResponseEntity<?> getMyInterests(@RequestParam String user_id) {
        try {
            Firestore db = FirestoreClient.getFirestore();
            DocumentReference userDoc = db.collection("UserData").document(user_id);

            DocumentSnapshot snapshot = userDoc.get().get();
            if (!snapshot.exists()) {
                return ResponseEntity.badRequest().body(Map.of("message", "사용자를 찾을 수 없습니다."));
            }

            List<String> likeList = (List<String>) snapshot.get("user_like_list");

            return ResponseEntity.ok(Map.of("user_like_list", likeList));
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "서버 오류가 발생했습니다."));
        }
    }

    //나의 글 리스트 조회 (예시, posts 컬렉션에 user_id 필드로 연결되어 있다고 가정)
    @GetMapping("/me/posts")
    public ResponseEntity<?> getMyPosts(@RequestParam String user_id) {
        try {
            Firestore db = FirestoreClient.getFirestore();
            CollectionReference posts = db.collection("Posts");

            Query query = posts.whereEqualTo("user_id", user_id);
            QuerySnapshot snapshot = query.get().get();

            List<Map<String, Object>> postList = new ArrayList<>();
            for (DocumentSnapshot doc : snapshot.getDocuments()) {
                postList.add(doc.getData());
            }

            return ResponseEntity.ok(postList);
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "서버 오류가 발생했습니다."));
        }
    }
}
