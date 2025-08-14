// src/main/java/com/openrun/dto/PfmCalendarUpdateRequest.java
package com.openrun.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class PfmCalendarUpdateRequest {
    private String pfmcalender_nm;
    private String pfmcalender_date;
    private String pfmcalender_time;
    private String pfmcalender_location;
    private String pfmcalender_seat;
    private String pfmcalender_today_cast;
    private String pfmcalender_cost;
    private String pfmcalender_memo;
    private String pfmcalender_bookingsite;
}