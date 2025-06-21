package com.openrun.controller;

import com.openrun.dto.CalendarEvent;
import com.openrun.service.CalendarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/calendar")
public class CalendarController {

    @Autowired
    private CalendarService calendarService;

    @GetMapping("/me")
    public List<CalendarEvent> getAllEvents() throws ExecutionException, InterruptedException {
        return calendarService.getAllEvents();
    }

    @PostMapping
    public String addEvent(@RequestBody CalendarEvent event) throws ExecutionException, InterruptedException {
        return calendarService.addEvent(event);
    }
}
