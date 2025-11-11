// src/main/java/com/openrun/controller/UserMainFavoriteController.java
package com.openrun.controller;

import com.openrun.dto.ApiResponse;
import com.openrun.dto.MainFavoriteRequest;
import com.openrun.dto.PfmLikeCalendarDTO;
import com.openrun.service.PfmLikeCalendarService;
import com.openrun.service.UserMainFavoriteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/user/me/main-favorite")
public class UserMainFavoriteController {

    private final UserMainFavoriteService userMainFavoriteService;
    private final PfmLikeCalendarService likeCalendarService;

    @GetMapping
    public ResponseEntity<PfmLikeCalendarDTO> list(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) throws Exception {
        return ResponseEntity.ok(likeCalendarService.getMyPriorityLikeEvents(authorization));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<List<String>>> add(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody(required = false) MainFavoriteRequest req
    ) throws Exception {
        if (req == null || !StringUtils.hasText(req.getPfmDocId())) {
            log.warn("[main-favorite][POST] bad request: body or pfm_doc_id missing");
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "pfm_doc_id 누락됨", null));
        }
        try {
            ApiResponse<List<String>> resp = userMainFavoriteService.addMainFavorite(authorization, req.getPfmDocId());
            return resp.isSuccess() ? ResponseEntity.ok(resp) : ResponseEntity.badRequest().body(resp);
        } catch (IllegalStateException ex) {
            log.warn("[main-favorite][POST] business rule violation: {}", ex.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, ex.getMessage(), null));
        } catch (Exception ex) {
            log.error("[main-favorite][POST] unexpected error", ex);
            // 내부 오류라도 메시지를 클라이언트가 볼 수 있게 전달
            return ResponseEntity.internalServerError().body(new ApiResponse<>(false, "서버 오류: " + ex.getClass().getSimpleName(), null));
        }
    }

    @DeleteMapping("/{pfm_doc_id}")
    public ResponseEntity<ApiResponse<List<String>>> delete(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable("pfm_doc_id") String pfmDocId
    ) throws Exception {
        try {
            ApiResponse<List<String>> resp = userMainFavoriteService.removeMainFavorite(authorization, pfmDocId);
            return resp.isSuccess() ? ResponseEntity.ok(resp) : ResponseEntity.badRequest().body(resp);
        } catch (Exception ex) {
            log.error("[main-favorite][DELETE] unexpected error", ex);
            return ResponseEntity.internalServerError().body(new ApiResponse<>(false, "서버 오류: " + ex.getClass().getSimpleName(), null));
        }
    }
}