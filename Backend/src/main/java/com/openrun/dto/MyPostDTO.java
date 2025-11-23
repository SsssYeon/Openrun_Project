package com.openrun.dto;

import java.util.List;
import java.util.Map;

public class MyPostDTO {
    private String postDocumentId;
    private String postTitle;
    private String postContent;
    private String postTimeStamp;
    private List<String> postImage;
    private List<String> postTag;
    private String userNickname;
    private int commentCount;

    // 생성자
    public MyPostDTO(String postDocumentId, String postTitle, String postContent,
                     String postTimeStamp, List<String> postImage, List<String> postTag,
                     String userNickname, int commentCount) {
        this.postDocumentId = postDocumentId;
        this.postTitle = postTitle;
        this.postContent = postContent;
        this.postTimeStamp = postTimeStamp;
        this.postImage = postImage;
        this.postTag = postTag;
        this.userNickname = userNickname;
        this.commentCount = commentCount;
    }

    // Firestore Map에서 DTO 생성
    public static MyPostDTO fromFirestoreMap(Map<String, Object> data, String documentId) {
        return new MyPostDTO(
                documentId, // 여기서 문서 ID 사용
                (String) data.get("postTitle"),
                (String) data.get("postContent"),
                (String) data.get("postTimeStamp"),
                (List<String>) data.getOrDefault("postImage", List.of()),
                (List<String>) data.getOrDefault("postTag", List.of()),
                (String) data.get("userNickname"),
                ((List<?>) data.getOrDefault("commentList", List.of())).size()
        );
    }

    // Getters
    public String getPostDocumentId() { return postDocumentId; }
    public String getPostTitle() { return postTitle; }
    public String getPostContent() { return postContent; }
    public String getPostTimeStamp() { return postTimeStamp; }
    public List<String> getPostImage() { return postImage; }
    public List<String> getPostTag() { return postTag; }
    public String getUserNickname() { return userNickname; }
    public int getCommentCount() { return commentCount; }
}
