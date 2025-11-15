package com.openrun.service;

import com.google.cloud.Timestamp;
import com.openrun.dto.CommunityCommentResponse;
import com.openrun.dto.CommunityPostRequest;
import com.openrun.dto.CommunityPostResponse;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.StorageClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.ExecutionException;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final Firestore firestore;
    private final AuthService authService;
    private final StorageClient storageClient;
    private static final String POST_COLLECTION = "PostData";
    private static final String COMMENT_COLLECTION = "Comments";
    private static final String DATE_FORMAT = "yyyy.MM.dd HH:mm";

    /** 타임스탬프 형식 변환 유틸리티 함수 */
    private String formatTimestamp(String timestamp) {
        try {
            // Firestore에 저장된 기본 Date.toString() 형식이라고 가정하고 파싱
            SimpleDateFormat dbFormat = new SimpleDateFormat("EEE MMM dd HH:mm:ss zzz yyyy", Locale.ENGLISH);
            Date date = dbFormat.parse(timestamp);

            // 요청하신 형식으로 포맷팅
            SimpleDateFormat targetFormat = new SimpleDateFormat(DATE_FORMAT, Locale.KOREA);
            return targetFormat.format(date);
        } catch (Exception e) {
            // 파싱 실패 시 원본 문자열 반환 (예외 처리 필요)
            return timestamp;
        }
    }

    /** 전체 커뮤니티 글 조회 + 태그 필터 + 검색 */
    public List<CommunityPostResponse> getAllPosts(String tag, String keyword) {
        List<CommunityPostResponse> postList = new ArrayList<>();

        try {
            ApiFuture<QuerySnapshot> future = firestore.collection(POST_COLLECTION)
                    .orderBy("postTimeStamp", Query.Direction.DESCENDING)
                    .get();

            List<QueryDocumentSnapshot> documents = future.get().getDocuments();

            for (QueryDocumentSnapshot doc : documents) {
                Map<String, Object> data = doc.getData();

                CommunityPostResponse post = new CommunityPostResponse();
                post.setPostDocumentId(doc.getId());
                post.setPostTitle((String) data.getOrDefault("postTitle", ""));
                post.setPostContent((String) data.getOrDefault("postContent", ""));
                post.setUserNickname((String) data.getOrDefault("userNickname", ""));
                post.setUserId((String) data.getOrDefault("userId", ""));
                post.setPostTimeStamp((String) data.getOrDefault("postTimeStamp", ""));
                post.setPostTag((List<String>) data.getOrDefault("postTag", new ArrayList<>()));
                post.setPostImage((List<String>) data.getOrDefault("postImage", new ArrayList<>()));
                //post.setCommentList((List<String>) data.getOrDefault("commentList", new ArrayList<>()));
                post.setPostReportCnt(((Long) data.getOrDefault("postReportCnt", 0L)).intValue());
                post.setPostState(((Long) data.getOrDefault("postState", 0L)).intValue());

                // 태그 필터링
                boolean tagMatches = (tag == null || tag.isEmpty() || post.getPostTag().contains(tag));

                // 검색어 필터링 (제목 또는 내용 포함)
                boolean keywordMatches = (keyword == null || keyword.isEmpty() ||
                        post.getPostTitle().toLowerCase().contains(keyword.toLowerCase()) ||
                        post.getPostContent().toLowerCase().contains(keyword.toLowerCase()));

                if (tagMatches && keywordMatches) {
                    postList.add(post);
                }
            }

        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
            throw new RuntimeException("게시글 목록 조회 중 오류 발생", e);
        }

        return postList;
    }

    /** 커뮤니티 글 작성 */
    public void createPost(CommunityPostRequest request, String token) throws Exception {
        // 1) 사용자 정보 조회
        List<QueryDocumentSnapshot> userDocs = firestore.collection("UserData")
                .whereEqualTo("userAutoLoginToken", token)
                .get().get().getDocuments();

        if (userDocs.isEmpty()) {
            throw new Exception("유효하지 않은 사용자입니다. 다시 로그인해주세요.");
        }

        DocumentSnapshot userDoc = userDocs.get(0);
        String userNickname = userDoc.getString("userNickname");
        String userId = userDoc.getString("userId");

        // 2) 이미지 업로드 처리
        List<String> imageUrls = new ArrayList<>();
        if (request.getPostImage() != null && !request.getPostImage().isEmpty()) {
            for (MultipartFile file : request.getPostImage()) {
                String fileName = "community/" + UUID.randomUUID() + "_" + Objects.requireNonNull(file.getOriginalFilename());
                storageClient.bucket().create(fileName, file.getBytes(), file.getContentType());
                String bucketName = storageClient.bucket().getName();
                String imageUrl = String.format(
                        "https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media",
                        bucketName,
                        fileName.replace("/", "%2F")
                );
                imageUrls.add(imageUrl);
            }
        }

        // 3) 게시글 데이터 구성 (DB 저장용)
        Map<String, Object> postData = new HashMap<>();
        postData.put("postTitle", request.getPostTitle());
        postData.put("postContent", request.getPostContent());
        postData.put("userNickname", userNickname);
        postData.put("userId", userId);
        postData.put("postTag", request.getPostTag() != null ? request.getPostTag() : new ArrayList<>());
        postData.put("postImage", imageUrls);
        postData.put("commentList", new ArrayList<>());
        postData.put("postReportCnt", 0L);
        postData.put("postState", 0L);
        postData.put("postTimeStamp", new java.text.SimpleDateFormat("yyyy.MM.dd HH:mm").format(new Date()));

        // 4) Firestore에 저장
        firestore.collection(POST_COLLECTION).add(postData).get();
    }

    /** 게시글 상세 조회 + 댓글 목록 포함 */
    public CommunityPostResponse getPostDetail(String postId, String currentUserId) throws ExecutionException, InterruptedException {

        System.out.println("조회할 postId: " + postId);

        DocumentSnapshot doc = firestore.collection(POST_COLLECTION).document(postId).get().get();

        if (!doc.exists()) {
            System.out.println("Firestore 문서 존재 여부: false");
            return null; // Controller에서 404 처리
        }

        System.out.println("Firestore 문서 존재 여부: true, documentId=" + doc.getId());

        CommunityPostResponse response = mapDocToResponse(doc, currentUserId);

        // 댓글 목록 조회
        List<CommunityCommentResponse> comments = getCommentsForPost(postId, currentUserId);
        response.setComments(comments); // CommunityPostResponse에 comments 필드 필요

        return response;
    }

    /** 댓글 목록 조회 */
    private List<CommunityCommentResponse> getCommentsForPost(String postId, String currentUserId) throws ExecutionException, InterruptedException {
        List<CommunityCommentResponse> commentList = new ArrayList<>();

        QuerySnapshot commentDocs = firestore.collection(POST_COLLECTION)
                .document(postId)
                .collection(COMMENT_COLLECTION)
                .orderBy("commentTimeStamp", Query.Direction.ASCENDING)
                .get().get();

        System.out.println("댓글 개수: " + commentDocs.size());

        for (QueryDocumentSnapshot doc : commentDocs) {
            CommunityCommentResponse comment = new CommunityCommentResponse();
            comment.setCommentDocumentId(doc.getId());
            comment.setPostDocumentId(postId);
            comment.setCommentContent(doc.getString("commentContent"));
            comment.setUserId(doc.getString("userId"));
            comment.setUserNickname(doc.getString("userNickname"));
            comment.setCommentTimeStamp(doc.getString("commentTimeStamp"));
            comment.setAuthor(currentUserId != null && currentUserId.equals(doc.getString("userId")));
            comment.setCommentReportCnt(doc.contains("commentReportCnt") ? ((Number) doc.get("commentReportCnt")).intValue() : 0);
            comment.setCommentState(doc.contains("commentState") ? ((Number) doc.get("commentState")).intValue() : 0);

            commentList.add(comment);
        }

        return commentList;
    }

    /** 문서 -> DTO 변환 */
    private CommunityPostResponse mapDocToResponse(DocumentSnapshot doc, String currentUserId) {
        CommunityPostResponse response = new CommunityPostResponse();
        response.setPostDocumentId(doc.getId());
        response.setPostTitle(doc.getString("postTitle"));
        response.setPostContent(doc.getString("postContent"));
        response.setUserId(doc.getString("userId"));
        response.setUserNickname(doc.getString("userNickname"));
        response.setPostTimeStamp(doc.getString("postTimeStamp"));
        response.setPostTag((List<String>) doc.get("postTag"));
        response.setPostImage((List<String>) doc.get("postImage"));
        response.setPostReportCnt(doc.contains("postReportCnt") ? ((Number) doc.get("postReportCnt")).intValue() : 0);
        response.setPostState(doc.contains("postState") ? ((Number) doc.get("postState")).intValue() : 1);

        response.setAuthor(currentUserId != null && currentUserId.equals(doc.getString("userId")));
        return response;
    }

    /** 댓글 작성 */

    /** 댓글 삭제 */

    /** 게시글 삭제 */

    /** 게시글 신고 */

    /** 댓글 신고 */
}
