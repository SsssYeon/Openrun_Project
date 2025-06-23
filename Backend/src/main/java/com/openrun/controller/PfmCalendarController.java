package com.openrun.controller;

import com.openrun.dto.PfmCalendarDTO;
import com.openrun.service.PfmCalendarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/calendar")
public class PfmCalendarController {

    private final PfmCalendarService calendarService;

    @Autowired
    public PfmCalendarController(PfmCalendarService calendarService) {
        this.calendarService = calendarService;
    }

    // 전체 관극 기록 조회
    @GetMapping("/me")
    public List<PfmCalendarDTO> getCalendarEvents() throws ExecutionException, InterruptedException {
        return calendarService.getAllEvents();
    }

    // 특정 ID의 관극 기록 상세 조회
    @GetMapping("/me/{id}")
    public PfmCalendarDTO getEventDetail(@PathVariable String id) throws ExecutionException, InterruptedException {
        return calendarService.getEventById(id);
    }

    // 관극 기록 추가
    @PostMapping(value = "/me", consumes = "multipart/form-data")
    public String addCalendarEvent(
            @RequestPart(value = "pfmcalender_poster", required = false) MultipartFile posterFile,
            @RequestPart("pfmcalender_nm") String name,
            @RequestPart("pfmcalender_date") String date,
            @RequestPart(value = "pfmcalender_time", required = false) String time,
            @RequestPart(value = "pfmcalender_location", required = false) String location,
            @RequestPart(value = "pfmcalender_seat", required = false) String seat,
            @RequestPart(value = "pfmcalender_today_cast", required = false) String cast,
            @RequestPart(value = "pfmcalender_cost", required = false) String cost,
            @RequestPart(value = "pfmcalender_memo", required = false) String memo
    ) throws Exception {
        return calendarService.addEvent(name, date, time, location, seat, cast, cost, memo, posterFile);
    }

    // 관극 기록 수정
    @PatchMapping(value = "/me/{id}", consumes = "multipart/form-data")
    public String updateCalendarEvent(
            @PathVariable String id,
            @RequestPart(value = "pfmcalender_poster", required = false) MultipartFile posterFile,
            @RequestPart("pfmcalender_nm") String name,
            @RequestPart("pfmcalender_date") String date,
            @RequestPart(value = "pfmcalender_time", required = false) String time,
            @RequestPart(value = "pfmcalender_location", required = false) String location,
            @RequestPart(value = "pfmcalender_seat", required = false) String seat,
            @RequestPart(value = "pfmcalender_today_cast", required = false) String cast,
            @RequestPart(value = "pfmcalender_cost", required = false) String cost,
            @RequestPart(value = "pfmcalender_memo", required = false) String memo
    ) throws Exception {
        return calendarService.updateEvent(id, name, date, time, location, seat, cast, cost, memo, posterFile);
    }
}