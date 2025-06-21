package com.openrun.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CalendarEvent {
    private String id;
    private String title;
    private String date;
    private String start;
    private String time;
    private String location;
    private String seat;
    private String cast;
    private String poster;
}