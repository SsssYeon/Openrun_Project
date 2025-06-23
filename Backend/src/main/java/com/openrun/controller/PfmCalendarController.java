package com.openrun.controller;

import com.openrun.dto.PfmCalendarDTO;
import com.openrun.service.PfmCalendarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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
    @PostMapping("/me")
    public String addCalendarEvent(@RequestBody PfmCalendarDTO dto) throws ExecutionException, InterruptedException {
        return calendarService.addEvent(dto);
    }
}


