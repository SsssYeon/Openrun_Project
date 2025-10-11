package com.openrun.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PfmDetailDto {
    private String mt20id;          // 공연 ID
    private String prfnm;           // 공연명
    private String prfpdfrom;       // 시작일
    private String prfpdto;         // 종료일
    private String fcltynm;         // 공연장명
    private String prfcast;         // 출연진
    private String prfruntime;      // 러닝타임
    private String prfage;          // 관람 연령
    private String entrpsnmP;       // 제작사
    private String pcseguidance;    // 티켓 가격
    private String poster;          // 포스터 이미지
    private String sty;             // 줄거리
    private String genrenm;         // 장르
    private String dtguidance;      // 공연 시간
}