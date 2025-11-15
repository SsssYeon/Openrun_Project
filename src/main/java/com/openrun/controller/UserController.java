package com.openrun.controller;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import com.openrun.dto.MypageMyPostDTO;
import com.openrun.service.CommunityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final Firestore firestore = FirestoreClient.getFirestore();
    private final CommunityService communityService;

    public UserController(CommunityService communityService) {
        this.communityService = communityService;
    }

    // 내 정보 조회
    @GetMapping("/me")
    public ResponseEntity<?> getMyInfo(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = extractToken(authHeader);
            if (token == null)
                return ResponseEntity.status(401).body(Map.of("message", "토큰이 없습니다."));

            CollectionReference users = firestore.collection("UserData");
            QuerySnapshot snapshot = users.whereEqualTo("userAutoLoginToken", token).get().get();

            if (snapshot.getDocuments().isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("message", "사용자를 찾을 수 없습니다."));
            }

            Map<String, Object> data = snapshot.getDocuments().get(0).getData();
            Map<String, Object> response = new HashMap<>();
            response.put("user_id", data.get("userId"));
            response.put("user_nm", data.get("userName"));
            response.put("user_nicknm", data.get("userNickname"));
            response.put("user_phonenum", data.get("userPhoneNumber"));

            return ResponseEntity.ok(response);

        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "서버 오류"));
        }
    }

    // 내 정보 수정
    @PatchMapping("/me")
    public ResponseEntity<?> updateMyInfo(@RequestHeader("Authorization") String authHeader,
                                          @RequestBody Map<String, String> req) {
        try {
            String token = extractToken(authHeader);
            if (token == null)
                return ResponseEntity.status(401).body(Map.of("message", "토큰이 없습니다."));

            CollectionReference users = firestore.collection("UserData");
            QuerySnapshot snapshot = users.whereEqualTo("userAutoLoginToken", token).get().get();

            if (snapshot.getDocuments().isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("message", "사용자를 찾을 수 없습니다."));
            }

            DocumentReference docRef = snapshot.getDocuments().get(0).getReference();
            Map<String, Object> updates = new HashMap<>();

            if (req.containsKey("user_nm")) updates.put("userName", req.get("user_nm"));
            if (req.containsKey("user_nicknm")) updates.put("userNickname", req.get("user_nicknm"));

            if (updates.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "수정할 정보가 없습니다."));
            }

            docRef.update(updates).get();
            return ResponseEntity.ok(Map.of("message", "수정 완료"));

        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "서버 오류"));
        }
    }

    // 비밀번호 변경
    @PatchMapping("/me/password")
    public ResponseEntity<?> changePassword(@RequestHeader("Authorization") String authHeader,
                                            @RequestBody Map<String, String> body) {
        String token = extractToken(authHeader);
        if (token == null) return ResponseEntity.status(401).body(Map.of("message", "토큰이 없습니다."));

        try {
            CollectionReference users = firestore.collection("UserData");
            QuerySnapshot snapshot = users.whereEqualTo("userAutoLoginToken", token).get().get();

            if (snapshot.getDocuments().isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("message", "사용자를 찾을 수 없습니다."));
            }

            DocumentSnapshot doc = snapshot.getDocuments().get(0);
            String storedPassword = doc.getString("userPw");
            String currentPassword = body.get("currentPassword");
            String newPassword = body.get("newPassword");

            if (storedPassword == null || !storedPassword.equals(currentPassword)) {
                return ResponseEntity.status(401).body(Map.of("message", "현재 비밀번호가 일치하지 않습니다."));
            }

            doc.getReference().update("userPw", newPassword).get();
            return ResponseEntity.ok(Map.of("message", "비밀번호가 변경되었습니다."));

        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "서버 오류"));
        }
    }

    // 계정 탈퇴
    @DeleteMapping("/me")
    public ResponseEntity<?> deleteMyAccount(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = extractToken(authHeader);
            if (token == null)
                return ResponseEntity.status(401).body(Map.of("message", "토큰이 없습니다."));

            CollectionReference users = firestore.collection("UserData");
            QuerySnapshot snapshot = users.whereEqualTo("userAutoLoginToken", token).get().get();

            if (snapshot.getDocuments().isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("message", "사용자를 찾을 수 없습니다."));
            }

            snapshot.getDocuments().get(0).getReference().delete().get();
            return ResponseEntity.ok(Map.of("message", "계정이 삭제되었습니다."));

        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "서버 오류"));
        }
    }

    @GetMapping("/me/posts")
    public ResponseEntity<Map<String, Object>> getMyPosts(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer "))
                return ResponseEntity.status(401).body(Map.of("message", "토큰 없음"));

            String token = authHeader.substring(7).trim(); // Bearer 제거

            // 1. 토큰으로 userId 조회
            CollectionReference usersRef = firestore.collection("UserData");
            QuerySnapshot userSnapshot = usersRef.whereEqualTo("userAutoLoginToken", token).get().get();

            if (userSnapshot.getDocuments().isEmpty())
                return ResponseEntity.status(404).body(Map.of("message", "사용자 없음"));

            String userId = userSnapshot.getDocuments().get(0).getString("userId");

            // 2. CommunityPosts에서 userId로 글 조회
            CollectionReference postsRef = firestore.collection("PostData");
            QuerySnapshot postsSnapshot = postsRef.whereEqualTo("userId", userId).get().get();

            List<MypageMyPostDTO> myPosts = new ArrayList<>();
            for (DocumentSnapshot doc : postsSnapshot.getDocuments()) {
                myPosts.add(MypageMyPostDTO.fromFirestoreMap(doc.getData(), doc.getId()));
            }

            // 최신순 정렬 (postTimeStamp 기준)
            myPosts.sort((a, b) -> b.getPostTimeStamp().compareTo(a.getPostTimeStamp()));

            Map<String, Object> response = new HashMap<>();
            response.put("posts", myPosts);

            return ResponseEntity.ok(response);

        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "서버 오류"));
        }
    }


    // Authorization 헤더에서 토큰 추출
    private String extractToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        return authHeader.substring(7).trim();
    }
}
