package com.openrun.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PfmSearchDto {
    private String pfm_doc_id; // 공연 ID (mt20id)
    private String pfm_nm;     // 공연 이름 (prfnm)
}