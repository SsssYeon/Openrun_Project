package com.openrun.controller;

import com.openrun.dto.PfmSearchDto;
import com.openrun.service.PfmSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/performances")
public class PfmSearchController {

    private final PfmSearchService pfmSearchService;

    @Autowired
    public PfmSearchController(PfmSearchService pfmSearchService) {
        this.pfmSearchService = pfmSearchService;
    }

    @GetMapping("/search")
    public List<PfmSearchDto> searchPerformances(@RequestParam("query") String query) {
        try {
            return pfmSearchService.searchPerformancesFromApi(query);
        } catch (Exception e) {
            System.err.println("API 요청 실패: " + e.getMessage());
            return List.of(); // 실패 시 빈 배열 반환 → 프론트 fallback
        }
    }
}