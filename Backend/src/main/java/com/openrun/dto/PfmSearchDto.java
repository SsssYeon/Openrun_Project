package com.openrun.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class PfmSearchDto {
    private String pfm_doc_id; // Firestore 문서 ID
    private String prfnm;      // 공연 이름

    public PfmSearchDto() {}

}
