// src/main/java/com/openrun/dto/UserStatisticsResponse.java
package com.openrun.dto;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserStatisticsResponse {
    private int total_view;                 // 전체 기록 수
    private int unique_pfm;                 // 서로 다른 공연 수
    private List<PfmCount> most_view_pfm;   // { pfm_nm, pfm_cnt }
    private List<ActorCount> most_view_actor; // { actor_nm, actor_cnt }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PfmCount {
        private String pfm_nm;
        private int pfm_cnt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ActorCount {
        private String actor_nm;
        private int actor_cnt;
    }
}