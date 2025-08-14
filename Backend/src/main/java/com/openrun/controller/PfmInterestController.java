package com.openrun.controller;

import com.openrun.service.PfmInterestService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/performances")
public class PfmInterestController {

    private final PfmInterestService pfmInterestService;

    @Autowired
    public PfmInterestController(PfmInterestService pfmInterestService) {
        this.pfmInterestService = pfmInterestService;
    }

    @GetMapping("/{id}/interest")
    public Map<String, Boolean> isInterest(@PathVariable String id, HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        System.out.println("🔑 Authorization Header: " + authHeader);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Map.of("isLiked", false);
        }

        String token = authHeader.substring(7);
        boolean isLiked = pfmInterestService.isLiked(token, id);
        return Map.of("isLiked", isLiked);
    }

    @PostMapping("/{id}/interest")
    public void addInterest(@PathVariable String id, HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return;

        String token = authHeader.substring(7);
        pfmInterestService.toggleInterest(token, id);
    }

    @DeleteMapping("/{id}/interest")
    public void removeInterest(@PathVariable String id, HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return;

        String token = authHeader.substring(7);
        pfmInterestService.toggleInterest(token, id);
    }
}