// src/main/java/com/openrun/dto/PfmCalendarDTO.java
package com.openrun.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class PfmCalendarDTO {
    private String pfmcalender_doc_no;       // 문서 ID
    private String pfmcalender_nm;
    private String pfmcalender_date;
    private String pfmcalender_time;
    private String pfmcalender_location;     // 응답은 location으로 통일 (DB는 place)
    private String pfmcalender_today_cast;
    private String pfmcalender_seat;
    private String pfmcalender_cost;
    private String pfmcalender_memo;
    private String pfmcalender_poster;
    private String pfmcalender_bookingsite;
}