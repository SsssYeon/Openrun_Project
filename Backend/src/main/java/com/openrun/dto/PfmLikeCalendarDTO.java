// src/main/java/com/openrun/dto/PfmLikeCalendarDTO.java
package com.openrun.dto;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PfmLikeCalendarDTO {
    private List<Item> userLikeList; // 프론트가 그대로 기대하는 키

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Item {
        private String id;          // mt20id
        private String pfm_doc_id;  // 상세 페이지 이동용(=mt20id)
        private String title;       // 공연명
        private String start;       // yyyy-MM-dd
        private String end;         // yyyy-MM-dd
        private String poster;      // 포스터 URL
    }
}