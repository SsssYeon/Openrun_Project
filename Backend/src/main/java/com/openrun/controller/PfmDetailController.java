package com.openrun.controller;

import com.openrun.dto.PfmDetailDto;
import com.openrun.service.PfmDetailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/performances")
public class PfmDetailController {

    private final PfmDetailService pfmDetailService;

    @Autowired
    public PfmDetailController(PfmDetailService pfmDetailService) {
        this.pfmDetailService = pfmDetailService;
    }

    @GetMapping("/{id}")
    public PfmDetailDto getPerformanceDetail(@PathVariable String id) throws ExecutionException, InterruptedException {
        return pfmDetailService.getPerformanceDetail(id);
    }
    /*
    @GetMapping("/{id}/interest")
    public Map<String, Boolean> checkInterest(@PathVariable String id, @RequestParam("user_id") String userId)
            throws ExecutionException, InterruptedException {
        boolean liked = pfmDetailService.isInterest(userId, id);
        return Map.of("isLiked", liked);
    }

    @PostMapping("/{id}/interest")
    public void addInterest(@PathVariable String id, @RequestBody Map<String, String> body) {
        String userId = body.get("user_id");
        String timestamp = body.get("likecalender_timestamp");
        pfmDetailService.addInterest(userId, id, timestamp);
    }

    @DeleteMapping("/{id}/interest")
    public void removeInterest(@PathVariable String id, @RequestParam("user_id") String userId)
            throws ExecutionException, InterruptedException {
        pfmDetailService.removeInterest(userId, id);
    }
     */
}