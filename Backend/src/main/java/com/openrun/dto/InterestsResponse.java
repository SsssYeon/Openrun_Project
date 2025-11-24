package com.openrun.dto;

import lombok.*;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class InterestsResponse {

    private List<Item> userLikeList;           // 관심 공연 리스트
    private List<Item> userPriorityLikeList;   // 달력에 노출할 우선 관심 공연

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Item {
        private String id;             // mt20id
        private String pfm_doc_id;     // 상세 페이지 이동용(=mt20id)
        private String title;          // 공연명
        private String start;          // yyyy-MM-dd
        private String end;            // yyyy-MM-dd
        private String poster;         // 포스터 URL
    }
}