package com.openrun.controller;

import com.openrun.dto.PfmSearchDto;
import com.openrun.service.PfmSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/performances")
public class PfmSearchController {

    private final PfmSearchService pfmSearchService;

    @Autowired
    public PfmSearchController(PfmSearchService pfmSearchService) {
        this.pfmSearchService = pfmSearchService;
    }

    @GetMapping("/search")
    public List<PfmSearchDto> searchPerformances(@RequestParam("query") String query)
            throws ExecutionException, InterruptedException {
        return pfmSearchService.searchPerformances(query);
    }
}