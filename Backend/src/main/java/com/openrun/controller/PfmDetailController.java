package com.openrun.controller;

import com.openrun.dto.PfmDetailDto;
import com.openrun.service.PfmDetailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/performances")
public class PfmDetailController {

    private final PfmDetailService pfmDetailService;

    @Autowired
    public PfmDetailController(PfmDetailService pfmDetailService) {
        this.pfmDetailService = pfmDetailService;
    }

    /* 공연 정보 상세 보기 */
    @GetMapping("/{id}")
    public PfmDetailDto getPerformanceDetail(@PathVariable String id) throws Exception {
        return pfmDetailService.getPerformanceDetail(id);
    }
}