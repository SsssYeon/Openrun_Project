package com.openrun.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommunityCommentResponse {
    private String commentDocumentId;
    private String postDocumentId;
    private String commentContent;
    private String userId;
    private String userNickname;
    private String commentTimeStamp;
    private int commentReportCnt;
    private int commentState;
    private boolean isAuthor; // 현재 로그인 사용자가 작성자인지 여부
}