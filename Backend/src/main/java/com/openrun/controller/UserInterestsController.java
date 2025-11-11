// src/main/java/com/openrun/controller/UserInterestsController.java
package com.openrun.controller;

import com.openrun.dto.InterestsResponse;
import com.openrun.service.UserInterestsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity; import org.springframework.web.bind.annotation.*;

@RestController @RequiredArgsConstructor
@RequestMapping("/api/users/me/interests")
public class UserInterestsController {
    private final UserInterestsService service;
    @GetMapping
    public ResponseEntity<InterestsResponse> getAll(
            @RequestHeader(value="Authorization", required=false) String authorization
    ) throws Exception {
        return ResponseEntity.ok(service.getAllInterestsWithFlag(authorization));
    }
}