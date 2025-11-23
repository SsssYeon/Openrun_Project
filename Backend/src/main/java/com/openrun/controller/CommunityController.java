package com.openrun.controller;

import com.openrun.dto.CommunityCommentRequestDTO;
import com.openrun.dto.CommunityCommentResponseDTO;
import com.openrun.dto.CommunityPostRequestDTO;
import com.openrun.dto.CommunityPostResponseDTO;
import com.openrun.service.AuthService;
import com.openrun.service.CommunityService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/community")
@RequiredArgsConstructor
public class CommunityController {
    @Autowired
    private final CommunityService communityService;
    @Autowired
    private AuthService authService;

    /** 전체 커뮤니티 글 조회 + 태그 필터 + 검색 */
    @GetMapping("/posts")
    public ResponseEntity<List<CommunityPostResponseDTO>> getAllPosts(
            @RequestParam(value = "tag", required = false) String tag,
            @RequestParam(value = "q", required = false) String keyword
    ) {
        try {
            List<CommunityPostResponseDTO> posts = communityService.getAllPosts(tag, keyword);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /** 커뮤니티 글 작성 */
    @PostMapping("/posts")
    public ResponseEntity<?> createPost(
            @ModelAttribute CommunityPostRequestDTO request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        try {
            if (authorization == null || !authorization.startsWith("Bearer ")) {
                return ResponseEntity.status(401)
                        .body(Map.of("success", false, "message", "인증 토큰이 없습니다."));
            }

            String token = authorization.substring(7); // "Bearer " 제거
            communityService.createPost(request, token);

            return ResponseEntity.ok(Map.of("success", true, "message", "게시글이 성공적으로 작성되었습니다."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", "글 작성 실패: " + e.getMessage()));
        }
    }

    /** 게시글 수정 */
    @PatchMapping("/posts/{postId}")
    public ResponseEntity<?> modifyPost(
            @PathVariable("postId") String postId,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(value = "postTitle") String postTitle,
            @RequestParam(value = "postContent") String postContent,
            @RequestParam(value = "postTag", required = false) List<String> postTag,
            @RequestParam(value = "existingImages", required = false) List<String> existingImages,
            @RequestParam(value = "newImages", required = false) List<MultipartFile> newImages
    ) {
        try {
            if (authorization == null || !authorization.startsWith("Bearer ")) {
                return ResponseEntity.status(401)
                        .body(Map.of("success", false, "message", "인증 토큰이 없습니다."));
            }

            String token = authorization.substring(7);
            String userId = authService.getUserIdFromToken(token);

            if (userId == null) {
                return ResponseEntity.status(401)
                        .body(Map.of("success", false, "message", "유효하지 않은 사용자입니다."));
            }

            communityService.modifyPost(
                    postId,
                    userId,
                    postTitle,
                    postContent,
                    postTag,
                    existingImages,
                    newImages
            );

            return ResponseEntity.ok(Map.of("success", true, "message", "게시글이 수정되었습니다."));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", "게시글 수정 실패: " + e.getMessage()));
        }
    }

    /**글 상세 조회*/
    @GetMapping("/posts/{postId}")
    public CommunityPostResponseDTO getPostDetail(
            @PathVariable("postId") String postId,
            @RequestHeader(value = "Authorization", required = false) String token
    ) throws ExecutionException, InterruptedException {

        String currentUserId = null;

        try {
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            currentUserId = authService.getUserIdFromToken(token);
        } catch (Exception e) {
            System.out.println("토큰에서 userId 조회 실패: " + e.getMessage());
        }

        CommunityPostResponseDTO response = communityService.getPostDetail(postId, currentUserId);

        if (response == null) {
            throw new RuntimeException("해당 커뮤니티 글을 찾을 수 없습니다.");
        }

        return response;
    }


    /** 댓글 작성 */
    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<?> createComment(
            @PathVariable("postId") String postId,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody CommunityCommentRequestDTO request
    ) {
        try {
            if (authorization == null || !authorization.startsWith("Bearer ")) {
                return ResponseEntity.status(401)
                        .body(Map.of("success", false, "message", "인증 토큰이 없습니다."));
            }

            String token = authorization.substring(7);
            String userId = authService.getUserIdFromToken(token);

            if (userId == null) {
                return ResponseEntity.status(401)
                        .body(Map.of("success", false, "message", "유효하지 않은 사용자입니다."));
            }

            CommunityCommentResponseDTO commentResponse = communityService.createComment(postId, userId, request);

            return ResponseEntity.ok(commentResponse);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", "댓글 작성 실패: " + e.getMessage()));
        }
    }

    /** 댓글 삭제 */
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable("commentId") String commentId,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        try {
            if (authorization == null || !authorization.startsWith("Bearer ")) {
                return ResponseEntity.status(401)
                        .body(Map.of("success", false, "message", "인증 토큰이 없습니다."));
            }

            String token = authorization.substring(7);
            String userId = authService.getUserIdFromToken(token);

            if (userId == null) {
                return ResponseEntity.status(401)
                        .body(Map.of("success", false, "message", "유효하지 않은 사용자입니다."));
            }

            boolean success = communityService.deleteComment(commentId, userId);

            if (!success) {
                return ResponseEntity.status(403)
                        .body(Map.of("success", false, "message", "삭제 권한이 없습니다."));
            }

            return ResponseEntity.ok(Map.of("success", true, "message", "댓글이 삭제되었습니다."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", "댓글 삭제 실패: " + e.getMessage()));
        }
    }

    /** 게시글 삭제 */
    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<?> deletePost(
            @PathVariable("postId") String postId,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        try {
            if (authorization == null || !authorization.startsWith("Bearer ")) {
                return ResponseEntity.status(401)
                        .body(Map.of("success", false, "message", "인증 토큰이 없습니다."));
            }

            String token = authorization.substring(7);
            String userId = authService.getUserIdFromToken(token);

            if (userId == null) {
                return ResponseEntity.status(401)
                        .body(Map.of("success", false, "message", "유효하지 않은 사용자입니다."));
            }

            boolean deleted = communityService.deletePost(postId, userId);

            if (!deleted) {
                return ResponseEntity.status(403)
                        .body(Map.of("success", false, "message", "삭제 권한이 없습니다."));
            }

            return ResponseEntity.ok(Map.of("success", true, "message", "게시글 및 관련 댓글이 삭제되었습니다."));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", "게시글 삭제 실패: " + e.getMessage()));
        }
    }

    /** 게시글 신고 */
    @PostMapping("/posts/{postId}/reports")
    public ResponseEntity<?> reportPost(
            @PathVariable("postId") String postId,
            @RequestHeader("Authorization") String authorization
    ) {
        try {
            if (authorization == null || !authorization.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("로그인이 필요합니다.");
            }

            String token = authorization.substring(7);

            boolean success = communityService.reportPost(postId);

            if (!success) {
                return ResponseEntity.status(404).body("게시글을 찾을 수 없습니다.");
            }

            return ResponseEntity.ok("게시글 신고가 완료되었습니다.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("게시글 신고 중 오류 발생");
        }
    }

    /** 댓글 신고 **/
    @PostMapping("/comments/{commentId}/reports")
    public ResponseEntity<?> reportComment(
            @PathVariable("commentId") String commentId,
            @RequestHeader("Authorization") String authorization
    ) {
        try {
            if (authorization == null || !authorization.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("로그인이 필요합니다.");
            }

            boolean success = communityService.reportComment(commentId);

            if (!success) {
                return ResponseEntity.status(404).body("댓글을 찾을 수 없습니다.");
            }

            return ResponseEntity.ok("댓글 신고가 완료되었습니다.");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("댓글 신고 중 오류 발생");
        }
    }

    /** 최근 커뮤니티 글 **/
    @GetMapping("/latest")
    public List<CommunityPostResponseDTO> getLatestPosts() {
        return communityService.getLatestPosts();
    }
}
