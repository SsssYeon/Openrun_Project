// src/main/java/com/openrun/controller/PfmLikeCalendarController.java
package com.openrun.controller;

import com.openrun.dto.PfmLikeCalendarDTO;
import com.openrun.service.PfmLikeCalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class PfmLikeCalendarController {

    private final PfmLikeCalendarService service;

    @GetMapping("/like")
    public ResponseEntity<PfmLikeCalendarDTO> getMyLikeCalendar(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) throws Exception {
        return ResponseEntity.ok(service.getMyLikeEvents(authorization));
    }
}