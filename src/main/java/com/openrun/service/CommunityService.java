package com.openrun.service;

import com.google.cloud.Timestamp;
import com.google.firebase.cloud.FirestoreClient;
import com.openrun.dto.*;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.StorageClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final Firestore firestore;
    private final AuthService authService;
    private final StorageClient storageClient;
    private static final String POST_COLLECTION = "PostData";
    private static final String COMMENT_COLLECTION = "CommentData";
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

    /**마이페이지 내가 쓴 글*/
    public List<MypageMyPostDTO> getUserPosts(String userId, int limit) {
        try {
            ApiFuture<QuerySnapshot> query = firestore.collection("CommunityPosts")
                    .whereEqualTo("userId", userId)
                    .get(); // String 타입 postTimeStamp 기준 정렬은 Java에서 처리

            List<QueryDocumentSnapshot> documents = query.get().getDocuments();

            return documents.stream()
                    .map(doc -> MypageMyPostDTO.fromFirestoreMap(doc.getData(), doc.getId()))
                    .sorted(Comparator.comparing(MypageMyPostDTO::getPostTimeStamp).reversed())
                    .limit(limit)
                    .collect(Collectors.toList());

        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
            return List.of();
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
                List<String> commentIds = (List<String>) data.getOrDefault("commentList", new ArrayList<>());
                post.setCommentCount(commentIds.size()); //댓글 개수
                post.setPostReportCnt(((Long) data.getOrDefault("postReportCnt", 0L)).intValue());
                post.setPostState(((Long) data.getOrDefault("postState", 0L)).intValue());

                // postState = 1이면 숨김
                if (post.getPostState() == 1) {
                    continue;
                }

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
    /** 게시글 수정*/
    public void modifyPost(
            String postId,
            String userId,
            String postTitle,
            String postContent,
            List<String> postTag,
            List<String> existingImages,
            List<MultipartFile> newImages
    ) throws Exception {

        // 1) 기존 게시글 조회
        DocumentReference docRef = firestore.collection(POST_COLLECTION).document(postId);
        DocumentSnapshot doc = docRef.get().get();

        if (!doc.exists()) {
            throw new Exception("게시글을 찾을 수 없습니다.");
        }

        // 2) 작성자 권한 확인
        String writerId = doc.getString("userId");
        if (!userId.equals(writerId)) {
            throw new Exception("게시글 수정 권한이 없습니다.");
        }

        // 3) 기존 이미지 목록
        List<String> originalImages = (List<String>) doc.get("postImage");
        if (originalImages == null) originalImages = new ArrayList<>();

        // 프론트에서 보낸 existingImages가 null이면 빈 리스트
        if (existingImages == null) existingImages = new ArrayList<>();

        // 4) 삭제 대상 이미지 (서버에 저장된 것 - 프론트가 유지한 것)
        List<String> imagesToDelete = new ArrayList<>();
        for (String img : originalImages) {
            if (!existingImages.contains(img)) {
                imagesToDelete.add(img);
            }
        }

        // 5) Firebase Storage에서 삭제할 이미지 삭제
        for (String imageUrl : imagesToDelete) {
            try {
                String bucketName = storageClient.bucket().getName();
                String prefix = String.format(
                        "https://firebasestorage.googleapis.com/v0/b/%s/o/",
                        bucketName
                );

                String fileName = imageUrl.replace(prefix, "").replace("?alt=media", "");
                fileName = fileName.replace("%2F", "/");

                storageClient.bucket().get(fileName).delete();
            } catch (Exception e) {
                System.out.println("이미지 삭제 실패: " + imageUrl);
            }
        }

        // 6) 새 이미지 업로드 후 URL 생성
        List<String> uploadedNewImages = new ArrayList<>();
        if (newImages != null) {
            for (MultipartFile file : newImages) {
                if (file != null && !file.isEmpty()) {
                    String fileName = "community/" + UUID.randomUUID() + "_" + file.getOriginalFilename();
                    storageClient.bucket().create(fileName, file.getBytes(), file.getContentType());

                    String bucketName = storageClient.bucket().getName();
                    String imageUrl = String.format(
                            "https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media",
                            bucketName,
                            fileName.replace("/", "%2F")
                    );

                    uploadedNewImages.add(imageUrl);
                }
            }
        }

        // 7) 최종 이미지 리스트 조합 (기존 유지 + 새 이미지)
        List<String> finalImages = new ArrayList<>();
        finalImages.addAll(existingImages);
        finalImages.addAll(uploadedNewImages);

        // 8) Firestore 업데이트
        Map<String, Object> updatedData = new HashMap<>();
        updatedData.put("postTitle", postTitle);
        updatedData.put("postContent", postContent);
        updatedData.put("postTag", postTag != null ? postTag : new ArrayList<>());
        updatedData.put("postImage", finalImages);

        docRef.update(updatedData).get();
    }

    /** 게시글 상세 조회 + 댓글 목록 포함 */
    public CommunityPostResponse getPostDetail(String postId, String currentUserId)
            throws ExecutionException, InterruptedException {

        DocumentSnapshot doc = firestore.collection(POST_COLLECTION)
                .document(postId)
                .get()
                .get();
        if (!doc.exists()) {
            System.out.println("Firestore 문서 존재 여부: false");
            return null;
        }

        CommunityPostResponse response = mapDocToResponse(doc, currentUserId);

        List<String> commentIds = (List<String>) doc.get("commentList");
        List<CommunityCommentResponse> comments = new ArrayList<>();

        if (commentIds != null && !commentIds.isEmpty()) {
            for (String commentId : commentIds) {
                DocumentSnapshot commentDoc = firestore.collection(COMMENT_COLLECTION)
                        .document(commentId)
                        .get()
                        .get();
                if (commentDoc.exists()) {
                    CommunityCommentResponse comment = new CommunityCommentResponse();
                    comment.setCommentDocumentId(commentDoc.getId());
                    comment.setPostDocumentId(postId);
                    comment.setCommentContent(commentDoc.getString("commentContent"));
                    comment.setUserId(commentDoc.getString("userId"));
                    comment.setUserNickname(commentDoc.getString("userNickname"));
                    comment.setCommentTimeStamp(commentDoc.getString("commentTimeStamp"));
                    comment.setAuthor(currentUserId != null &&
                            currentUserId.equals(commentDoc.getString("userId")));
                    comment.setCommentReportCnt(commentDoc.contains("commentReportCnt") ? ((Number) commentDoc.get("commentReportCnt")).intValue() : 0);
                    comment.setCommentState(commentDoc.contains("commentState") ? ((Number) commentDoc.get("commentState")).intValue() : 0);

                    if (comment.getCommentState() != 1) {
                        comments.add(comment);
                    }
                }
            }
        }
        response.setComments(comments);

        return response;
    }

    /** 문서 → DTO 변환 */
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

        // 현재 로그인 유저가 작성자인지 체크
        response.setAuthor(currentUserId != null && currentUserId.equals(doc.getString("userId")));

        return response;
    }

    /** 댓글 목록 조회 */
    private List<CommunityCommentResponse> getCommentsForPost(String postId, String currentUserId)
            throws ExecutionException, InterruptedException {
        List<CommunityCommentResponse> commentList = new ArrayList<>();

        QuerySnapshot commentDocs = firestore.collection(POST_COLLECTION)
                .document(postId)
                .collection(COMMENT_COLLECTION)
                .orderBy("commentTimeStamp", Query.Direction.ASCENDING)
                .get().get();

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

            if (comment.getCommentState() != 1) {
                commentList.add(comment);
            }

        }

        return commentList;
    }

    /** 댓글 작성 */
    public CommunityCommentResponse createComment(String postId, String userId, CommunityCommentRequest request)
            throws ExecutionException, InterruptedException {

        // 1) 사용자 정보 조회
        List<QueryDocumentSnapshot> userDocs = firestore.collection("UserData")
                .whereEqualTo("userId", userId)
                .get().get().getDocuments();
        if (userDocs.isEmpty()) {
            throw new RuntimeException("유효하지 않은 사용자입니다.");
        }
        String userNickname = userDocs.get(0).getString("userNickname");

        // 2) 댓글 ID 생성 (Firestore 문서 ID)
        DocumentReference commentRef = firestore.collection(COMMENT_COLLECTION).document();
        String commentId = commentRef.getId();

        // 3) 댓글 데이터 구성 (DB 저장용)
        Map<String, Object> commentData = new HashMap<>();
        commentData.put("commentDocumentId", commentId); // DB에도 저장
        commentData.put("postDocumentId", postId);       // DB에도 저장
        commentData.put("commentContent", request.getCommentContent());
        commentData.put("userId", userId);
        commentData.put("userNickname", userNickname);
        commentData.put("commentTimeStamp", new SimpleDateFormat(DATE_FORMAT).format(new Date()));
        commentData.put("commentReportCnt", 0L);
        commentData.put("commentState", 0L);

        // 4) Firestore에 댓글 추가
        commentRef.set(commentData).get();

        // 5) 게시글 문서에 댓글 ID 추가
        DocumentReference postRef = firestore.collection(POST_COLLECTION).document(postId);
        postRef.update("commentList", FieldValue.arrayUnion(commentId)).get();

        // 6) 반환 DTO 구성 (프론트용)
        CommunityCommentResponse response = new CommunityCommentResponse();
        response.setCommentDocumentId(commentId);
        response.setPostDocumentId(postId);
        response.setCommentContent(request.getCommentContent());
        response.setUserId(userId);
        response.setUserNickname(userNickname);
        response.setCommentTimeStamp((String) commentData.get("commentTimeStamp"));
        response.setCommentReportCnt(0);
        response.setCommentState(0);
        response.setAuthor(true); // 작성자이므로 true

        return response;
    }

    /** 댓글 삭제 */
    public boolean deleteComment(String commentId, String userId)
            throws ExecutionException, InterruptedException {

        DocumentReference commentRef = firestore.collection(COMMENT_COLLECTION).document(commentId);
        DocumentSnapshot commentDoc = commentRef.get().get();

        if (!commentDoc.exists()) {
            throw new NoSuchElementException("해당 댓글이 존재하지 않습니다.");
        }

        String commentAuthorId = commentDoc.getString("userId");
        String postId = commentDoc.getString("postDocumentId");

        // 작성자만 삭제 가능
        if (!userId.equals(commentAuthorId)) {
            return false; // 권한 없음
        }

        // 1) 댓글 문서 삭제
        commentRef.delete().get();

        // 2) 게시글의 commentList 배열에서 댓글 ID 제거
        if (postId != null && !postId.isEmpty()) {
            DocumentReference postRef = firestore.collection(POST_COLLECTION).document(postId);
            postRef.update("commentList", FieldValue.arrayRemove(commentId)).get();
        }

        return true;
    }

    /** 게시글 삭제 + 게시글의 모든 댓글 삭제 */
    public boolean deletePost(String postId, String userId) throws ExecutionException, InterruptedException {

        // 1. 게시글 문서 조회
        DocumentReference postRef = firestore.collection(POST_COLLECTION).document(postId);
        DocumentSnapshot postSnapshot = postRef.get().get();

        if (!postSnapshot.exists()) return false;

        String postOwnerId = postSnapshot.getString("userId");

        // 2. 권한 검사
        if (!Objects.equals(postOwnerId, userId)) {
            return false; // 작성자 아님 → 삭제 불가
        }

        // 3. Firestore batch 생성
        WriteBatch batch = firestore.batch();

        // 4. 게시글 삭제
        batch.delete(postRef);

        // 5. 이 게시글에 달린 댓글 일괄 조회
        Query commentQuery = firestore.collection(COMMENT_COLLECTION)
                .whereEqualTo("postDocumentId", postId);

        ApiFuture<QuerySnapshot> commentFuture = commentQuery.get();
        List<QueryDocumentSnapshot> commentDocs = commentFuture.get().getDocuments();

        // 6. 댓글 일괄 삭제
        for (QueryDocumentSnapshot commentDoc : commentDocs) {
            batch.delete(commentDoc.getReference());
        }

        // 7. batch commit – 실제 Firestore 반영
        batch.commit().get();

        return true;
    }


    /** 게시글 신고 */
    public boolean reportPost(String postId) throws ExecutionException, InterruptedException {
        Firestore firestore = FirestoreClient.getFirestore();
        DocumentReference postRef = firestore.collection(POST_COLLECTION).document(postId);

        DocumentSnapshot postDoc = postRef.get().get();

        if (!postDoc.exists()) return false;

        Object reportCntObj = postDoc.get("postReportCnt");
        int currentReportCnt = 0;

        if (reportCntObj instanceof Number) {
            currentReportCnt = ((Number) reportCntObj).intValue();
        }

        int updatedReportCnt = currentReportCnt + 1;

        Map<String, Object> updates = new HashMap<>();
        updates.put("postReportCnt", updatedReportCnt);

        if (updatedReportCnt > 5) {
            updates.put("postState", 1);
        }

        postRef.update(updates).get();
        return true;
    }

    /** 댓글 신고 */
    public boolean reportComment(String commentId) throws ExecutionException, InterruptedException {
        Firestore firestore = FirestoreClient.getFirestore();
        DocumentReference commentRef = firestore.collection(COMMENT_COLLECTION).document(commentId);

        DocumentSnapshot commentDoc = commentRef.get().get();

        if (!commentDoc.exists()) return false;

        Object reportCntObj = commentDoc.get("commentReportCnt");
        int currentReportCnt = 0;

        if (reportCntObj instanceof Number) {
            currentReportCnt = ((Number) reportCntObj).intValue();
        }

        int updatedReportCnt = currentReportCnt + 1;

        Map<String, Object> updates = new HashMap<>();
        updates.put("commentReportCnt", updatedReportCnt);

        // 기준치 넘으면 숨김 처리
        if (updatedReportCnt > 5) {
            updates.put("commentState", 1);
        }

        commentRef.update(updates).get();
        return true;
    }

}
