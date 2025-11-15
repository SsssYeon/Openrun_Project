package com.openrun.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class CommunityPostResponse {
    private String postDocumentId;
    private String postTitle;
    private String postContent;
    private String userNickname;
    private String userId;
    private String postTimeStamp;
    private List<String> postTag;
    private List<String> postImage;
    private int postReportCnt;
    private int postState;
    private List<CommunityCommentResponse> comments;
    @JsonProperty("isAuthor") // JSON 직렬화 시 isAuthor로 내려줌
    private boolean author;
}