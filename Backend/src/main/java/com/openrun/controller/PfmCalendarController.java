package com.openrun.controller;

import com.openrun.dto.PfmCalendarEvent;
import com.openrun.service.PfmCalendarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/calendar")
public class PfmCalendarController {

    @Autowired
    private PfmCalendarService calendarService;

    @GetMapping("/me")
    public List<PfmCalendarEvent> getCalendarEvents() throws ExecutionException, InterruptedException {
        return calendarService.getAllEvents();
    }
}
