package com.openrun.controller;

import com.openrun.dto.CommunityPostRequest;
import com.openrun.dto.CommunityPostResponse;
import com.openrun.service.AuthService;
import com.openrun.service.CommunityService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
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
    public ResponseEntity<List<CommunityPostResponse>> getAllPosts(
            @RequestParam(value = "tag", required = false) String tag,
            @RequestParam(value = "q", required = false) String keyword
    ) {
        try {
            List<CommunityPostResponse> posts = communityService.getAllPosts(tag, keyword);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /** 커뮤니티 글 작성 */
    @PostMapping("/posts")
    public ResponseEntity<?> createPost(
            @ModelAttribute CommunityPostRequest request,
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

    /** 게시글 상세 조회 + 댓글 포함 */
    @GetMapping("/posts/{postId}")
    public Map<String, Object> getPostDetail(
            @PathVariable("postId") String postId,
            @RequestHeader(value = "Authorization", required = false) String token
    ) throws ExecutionException, InterruptedException {
        String currentUserId = null;
        try {
            currentUserId = authService.getUserIdFromToken(token);
        } catch (Exception e) {
            System.out.println("토큰에서 userId 조회 실패: " + e.getMessage());
        }

        CommunityPostResponse response = communityService.getPostDetail(postId, currentUserId);
        if (response == null) {
            throw new RuntimeException("해당 커뮤니티 글을 찾을 수 없습니다.");
        }

        return Map.of(
                "post", response,
                "comments", response.getComments()  // CommunityPostResponse 안에 댓글 리스트가 있어야 함
        );
    }

    /** 댓글 작성 */

    /** 댓글 삭제 */

    /** 게시글 삭제 */

    /** 게시글 신고 */

    /** 댓글 신고 */
}
