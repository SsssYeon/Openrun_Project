// src/main/java/com/openrun/controller/PfmCalendarController.java
package com.openrun.controller;

import com.openrun.dto.PfmCalendarDTO;
import com.openrun.dto.PfmCalendarUpdateRequest;
import com.openrun.service.PfmCalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/calendar")
public class PfmCalendarController {

    private final PfmCalendarService calendarService;

    /** 내 관극 기록 전체 조회 */
    @GetMapping("/me")
    public ResponseEntity<List<PfmCalendarDTO>> getCalendarEvents(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) throws Exception {
        return ResponseEntity.ok(calendarService.getAllEventsForMe(authHeader));
    }

    /** 내 관극 기록 단건 조회 */
    @GetMapping("/me/{id}")
    public ResponseEntity<PfmCalendarDTO> getEventDetail(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String id
    ) throws Exception {
        PfmCalendarDTO dto = calendarService.getMyEventById(authHeader, id);
        return (dto == null) ? ResponseEntity.notFound().build() : ResponseEntity.ok(dto);
    }

    /** 관극 기록 추가 (파일 포함 – 프론트 Addrecord와 매칭) */
    @PostMapping(value = "/me", consumes = "multipart/form-data")
    public ResponseEntity<String> addCalendarEventMultipart(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestPart(value = "pfmcalender_poster", required = false) MultipartFile posterFile,
            @RequestPart("pfmcalender_nm") String name,
            @RequestPart("pfmcalender_date") String date,
            @RequestPart(value = "pfmcalender_time", required = false) String time,
            @RequestPart(value = "pfmcalender_location", required = false) String location,
            @RequestPart(value = "pfmcalender_seat", required = false) String seat,
            @RequestPart(value = "pfmcalender_today_cast", required = false) String cast,
            @RequestPart(value = "pfmcalender_cost", required = false) String cost,
            @RequestPart(value = "pfmcalender_memo", required = false) String memo,
            @RequestPart(value = "pfmcalender_bookingsite", required = false) String bookingsite
    ) throws Exception {
        String id = calendarService.addMyEvent(authHeader, name, date, time, location, seat, cast, cost, memo, bookingsite, posterFile);
        return ResponseEntity.ok(id);
    }

    /** (선택) 파일 없이 JSON으로 생성하고 싶을 때 사용 */
    @PostMapping(value = "/me", consumes = "application/json")
    public ResponseEntity<String> addCalendarEventJson(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody PfmCalendarUpdateRequest body
    ) throws Exception {
        return ResponseEntity.ok(calendarService.addMyEventJson(authHeader, body));
    }

    /** 관극 기록 수정 (JSON – 프론트 Modifyrecord와 매칭) */
    @PutMapping(value = "/me/{id}", consumes = "application/json")
    public ResponseEntity<String> updateCalendarEventJson(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String id,
            @RequestBody PfmCalendarUpdateRequest req
    ) throws Exception {
        return calendarService.updateMyEventJsonResponse(authHeader, id, req);
    }

    /** 관극 기록 삭제 */
    @DeleteMapping("/me/{id}")
    public ResponseEntity<String> deleteCalendarEvent(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String id
    ) throws Exception {
        return calendarService.deleteMyEventResponse(authHeader, id);
    }
}



/*
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
 */