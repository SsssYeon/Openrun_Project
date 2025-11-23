// src/main/java/com/openrun/controller/PfmCalendarController.java
package com.openrun.controller;

import com.openrun.dto.PfmCalendarDTO;
import com.openrun.dto.PfmCalendarUpdateRequest;
import com.openrun.service.PfmCalendarService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
@Slf4j
public class PfmCalendarController {

    private final PfmCalendarService service;

    /* 내 관극 기록 전체 조회 */
    @GetMapping("/me")
    public ResponseEntity<List<PfmCalendarDTO>> getMyCalendar(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) throws Exception {
        return ResponseEntity.ok(service.getAllEventsForMe(authorization));
    }

    /* 상세 조회 */
    @GetMapping("/me/{id}")
    public ResponseEntity<PfmCalendarDTO> getMyCalendarItem(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable String id
    ) throws Exception {
        PfmCalendarDTO dto = service.getMyEventById(authorization, id);
        return dto == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(dto);
    }

    /* 관극 기록 추가(multipart/form-data) */
    @PostMapping(value = "/me", consumes = "multipart/form-data")
    public ResponseEntity<?> createMyCalendarItemMultipart(
            @RequestHeader(value = "Authorization", required = false) String authorization,
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
        try {
            String id = service.addMyEvent(authorization, name, date, time, location, seat, cast, cost, memo, bookingsite, posterFile);
            return ResponseEntity.ok(id);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("unauthorized");
        }
    }

    /* 관극 기록 추가(JSON) */
    @PostMapping(value = "/me", consumes = "application/json")
    public ResponseEntity<?> createMyCalendarItemJson(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody PfmCalendarUpdateRequest body
    ) throws Exception {
        try {
            return ResponseEntity.ok(service.addMyEventJson(authorization, body));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("unauthorized");
        }
    }

    /* 관극 기록 수정 */
    @PutMapping(value = "/me/{id}", consumes = "application/json")
    public ResponseEntity<String> updateMyCalendarItem(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable String id,
            @RequestBody PfmCalendarUpdateRequest req
    ) throws Exception {
        return service.updateMyEventJsonResponse(authorization, id, req);
    }

    /* 관극 기록 삭제 */
    @DeleteMapping("/me/{id}")
    public ResponseEntity<String> deleteMyCalendarItem(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable String id
    ) throws Exception {
        return service.deleteMyEventResponse(authorization, id);
    }
}