package com.openrun.controller;

import com.openrun.service.UserLikePfmDetailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/performances")
public class UserLikePfmDetailController {

    private final UserLikePfmDetailService detailService;

    public UserLikePfmDetailController(UserLikePfmDetailService detailService) {
        this.detailService = detailService;
    }

    // 관심공연 상세조회
    @GetMapping("/{mt20id}/interest")
    public ResponseEntity<Map<String, Object>> getUserLikePerformance(@PathVariable String mt20id) {
        try {
            Map<String, Object> detail = detailService.getPerformanceDetail(mt20id);
            if (detail == null) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(detail);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
}
