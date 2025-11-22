package com.openrun.controller;

import com.openrun.dto.PfmRankingDTO;
import com.openrun.service.PfmRankingService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class PfmRankingController {

    private final PfmRankingService rankingService;

    public PfmRankingController(PfmRankingService rankingService) {
        this.rankingService = rankingService;
    }
/**
    @GetMapping("/api/performances/ranking")
    public List<PfmRankingDTO> getWeeklyRanking() {
        return rankingService.getThisWeekRanking();
    }
 **/
}
