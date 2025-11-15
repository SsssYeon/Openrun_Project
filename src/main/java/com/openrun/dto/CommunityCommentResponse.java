package com.openrun.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommunityCommentResponse {
    private String commentDocumentId;
    private String postDocumentId;
    private String commentContent;
    private String userNickname;
    private String userId;
    private String commentTimeStamp;
    private int commentReportCnt;
    private int commentState;
    @JsonProperty("isAuthor") // JSON 직렬화 시 isAuthor로 내려줌
    private boolean author;

    public void setAuthor(boolean author) {
        this.author = author;
    }
}