// src/main/java/com/openrun/dto/InterestsResponse.java
package com.openrun.dto;

import lombok.*;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class InterestsResponse {
    /** 프론트가 기대하는 키 이름을 그대로 사용 (userLikeList) */
    private List<Item> userLikeList;

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Item {
        private String id;             // mt20id
        private String pfm_doc_id;     // 상세 페이지 이동용(=mt20id)
        private String title;          // 공연명
        private String start;          // yyyy-MM-dd
        private String end;            // yyyy-MM-dd
        private String poster;         // 포스터 URL
        private boolean is_main_favorite; // 달력 노출 여부(❤️)
    }
}