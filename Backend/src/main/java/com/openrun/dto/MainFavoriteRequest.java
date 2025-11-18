// src/main/java/com/openrun/dto/MainFavoriteRequest.java
package com.openrun.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class MainFavoriteRequest {
    @JsonProperty("pfm_doc_id")
    private String pfmDocId;
}