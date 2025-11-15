package com.openrun.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@Getter
@Setter
public class CommunityPostRequest {
    private String postTitle;             // 글 제목
    private String postContent;           // 글 내용
    private List<String> postTag;         // 글 태그
    private List<MultipartFile> postImage; // 업로드 이미지
}
