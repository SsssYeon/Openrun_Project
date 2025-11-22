package com.openrun.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PfmRankingDTO {
    private String pfm_doc_id;
    private String pfm_nm;
    private String pfm_start;
    private String pfm_end;
    private String pfm_poster;
    private int regCnt;
}