package com.openrun.dto;

public class PfmDetailDto {
    private String pfm_doc_id;         // Firestore 문서 ID (직접 set 필요)

    private String mt20id;             // 공연 ID
    private String mt10id;             // 공연시설 ID
    private String prfnm;              // 공연명
    private String prfpdfrom;          // 공연 시작일
    private String prfpdto;            // 공연 종료일
    private String fcltynm;            // 공연장명
    private String prfcast;            // 출연진
    private String prfcrew;            // 제작진
    private String prfruntime;         // 러닝타임
    private String prfage;             // 관람 연령
    private String entrpsnmP;          // 제작사
    private String entrpsnmA;          // 기획사
    private String entrpsnmH;          // 주최
    private String entrpsnmS;          // 주관
    private String pcseguidance;       // 티켓가격
    private String poster;             // 포스터 URL
    private String sty;                // 줄거리
    private String genrenm;            // 장르명
    private String prfstate;           // 공연상태
    private String openrun;            // 오픈런 여부
    private String visit;              // 내한 여부
    private String child;              // 아동 여부
    private String daehakro;           // 대학로 여부
    private String festival;           // 축제 여부
    private String musicallicense;     // 뮤지컬 라이선스 여부
    private String musicalcreate;      // 뮤지컬 창작 여부
    private String updatedate;         // 최종수정일
    private String styurl;             // 소개이미지 URL
    private String dtguidance;         // 공연 시간

    public PfmDetailDto() {}

    // --- Getter/Setter 생략 가능 (필요 시 IDE로 자동 생성하세요) ---

    public String getPfm_doc_id() { return pfm_doc_id; }
    public void setPfm_doc_id(String pfm_doc_id) { this.pfm_doc_id = pfm_doc_id; }

    public String getMt20id() { return mt20id; }
    public void setMt20id(String mt20id) { this.mt20id = mt20id; }

    public String getMt10id() { return mt10id; }
    public void setMt10id(String mt10id) { this.mt10id = mt10id; }

    public String getPrfnm() { return prfnm; }
    public void setPrfnm(String prfnm) { this.prfnm = prfnm; }

    public String getPrfpdfrom() { return prfpdfrom; }
    public void setPrfpdfrom(String prfpdfrom) { this.prfpdfrom = prfpdfrom; }

    public String getPrfpdto() { return prfpdto; }
    public void setPrfpdto(String prfpdto) { this.prfpdto = prfpdto; }

    public String getFcltynm() { return fcltynm; }
    public void setFcltynm(String fcltynm) { this.fcltynm = fcltynm; }

    public String getPrfcast() { return prfcast; }
    public void setPrfcast(String prfcast) { this.prfcast = prfcast; }

    public String getPrfcrew() { return prfcrew; }
    public void setPrfcrew(String prfcrew) { this.prfcrew = prfcrew; }

    public String getPrfruntime() { return prfruntime; }
    public void setPrfruntime(String prfruntime) { this.prfruntime = prfruntime; }

    public String getPrfage() { return prfage; }
    public void setPrfage(String prfage) { this.prfage = prfage; }

    public String getEntrpsnmP() { return entrpsnmP; }
    public void setEntrpsnmP(String entrpsnmP) { this.entrpsnmP = entrpsnmP; }

    public String getEntrpsnmA() { return entrpsnmA; }
    public void setEntrpsnmA(String entrpsnmA) { this.entrpsnmA = entrpsnmA; }

    public String getEntrpsnmH() { return entrpsnmH; }
    public void setEntrpsnmH(String entrpsnmH) { this.entrpsnmH = entrpsnmH; }

    public String getEntrpsnmS() { return entrpsnmS; }
    public void setEntrpsnmS(String entrpsnmS) { this.entrpsnmS = entrpsnmS; }

    public String getPcseguidance() { return pcseguidance; }
    public void setPcseguidance(String pcseguidance) { this.pcseguidance = pcseguidance; }

    public String getPoster() { return poster; }
    public void setPoster(String poster) { this.poster = poster; }

    public String getSty() { return sty; }
    public void setSty(String sty) { this.sty = sty; }

    public String getGenrenm() { return genrenm; }
    public void setGenrenm(String genrenm) { this.genrenm = genrenm; }

    public String getPrfstate() { return prfstate; }
    public void setPrfstate(String prfstate) { this.prfstate = prfstate; }

    public String getOpenrun() { return openrun; }
    public void setOpenrun(String openrun) { this.openrun = openrun; }

    public String getVisit() { return visit; }
    public void setVisit(String visit) { this.visit = visit; }

    public String getChild() { return child; }
    public void setChild(String child) { this.child = child; }

    public String getDaehakro() { return daehakro; }
    public void setDaehakro(String daehakro) { this.daehakro = daehakro; }

    public String getFestival() { return festival; }
    public void setFestival(String festival) { this.festival = festival; }

    public String getMusicallicense() { return musicallicense; }
    public void setMusicallicense(String musicallicense) { this.musicallicense = musicallicense; }

    public String getMusicalcreate() { return musicalcreate; }
    public void setMusicalcreate(String musicalcreate) { this.musicalcreate = musicalcreate; }

    public String getUpdatedate() { return updatedate; }
    public void setUpdatedate(String updatedate) { this.updatedate = updatedate; }

    public String getStyurl() { return styurl; }
    public void setStyurl(String styurl) { this.styurl = styurl; }

    public String getDtguidance() {
        return dtguidance;
    }

    public void setDtguidance(String dtguidance) {
        this.dtguidance = dtguidance;
    }
}