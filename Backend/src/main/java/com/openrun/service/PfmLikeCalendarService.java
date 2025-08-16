// src/main/java/com/openrun/service/PfmLikeCalendarService.java
package com.openrun.service;

import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.Query;
import com.google.cloud.firestore.QuerySnapshot;
import com.openrun.dto.PfmLikeCalendarDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.w3c.dom.*;

import javax.xml.parsers.DocumentBuilderFactory;
import java.net.URLEncoder;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.concurrent.ExecutionException;

@Service
@RequiredArgsConstructor
@Slf4j
public class PfmLikeCalendarService {

    private static final String USER_COLLECTION = "UserData";

    private final Firestore firestore;
    private final RestTemplate restTemplate;

    /** application.properties: kopis.api.key=YOUR_KEY */
    @Value("${kopis.api.key}")
    private String kopisApiKey;

    /** (선택) dummy-token 수신 시 사용할 기본 UserData 문서ID */
    @Value("${dev.default.userdoc:wkAGLwZbn7M5npJ1fLBq}")
    private String devDefaultUserDocId;

    /* ================= 토큰 해석 (PfmCalendarService 스타일) ================= */

    private String extractToken(String authHeader) {
        if (authHeader == null || authHeader.isBlank()) return null;
        return authHeader.startsWith("Bearer ")
                ? authHeader.substring(7).trim()
                : authHeader.trim();
    }

    /**
     * Authorization 토큰으로 UserData를 검색하여 **문서 ID**를 반환.
     * - userAutoLoginToken == token
     * - 없고 token == "dummy-token"이면 devDefaultUserDocId 사용
     */
    private String getUserDocIdByToken(String authHeader) throws ExecutionException, InterruptedException {
        String token = extractToken(authHeader);
        if (token == null || token.isBlank()) return null;

        Query q = firestore.collection(USER_COLLECTION)
                .whereEqualTo("userAutoLoginToken", token)
                .limit(1);

        QuerySnapshot qs = q.get().get();
        if (!qs.isEmpty()) {
            return qs.getDocuments().get(0).getId(); // 문서 ID 반환
        }

        //if ("dummy-token".equals(token)) return devDefaultUserDocId;             // 개발 우회

        return null;
    }

    /* ================= 메인 API ================= */

    public PfmLikeCalendarDTO getMyLikeEvents(String authHeader) throws Exception {
        String userDocId = getUserDocIdByToken(authHeader);
        if (userDocId == null) {
            return PfmLikeCalendarDTO.builder().userLikeList(Collections.emptyList()).build();
        }

        // UserData/{docId}에서 userLikeList 읽기
        DocumentSnapshot userDoc = firestore.collection(USER_COLLECTION).document(userDocId).get().get();
        List<String> likeIds = userDoc.exists()
                ? (List<String>) userDoc.get("userLikeList")
                : Collections.emptyList();
        if (likeIds == null) likeIds = Collections.emptyList();

        List<PfmLikeCalendarDTO.Item> items = new ArrayList<>();
        for (String mt20id : likeIds) {
            if (mt20id == null || mt20id.isBlank()) continue;
            try {
                items.add(fetchDetailFromOpenApiWithRetry(mt20id));
            } catch (Exception e) {
                log.warn("KOPIS 조회 실패 mt20id={}: {}", mt20id, e.toString());
                items.add(minimalItem(mt20id)); // 폴백
            }
        }

        return PfmLikeCalendarDTO.builder().userLikeList(items).build();
    }

    /* ================= KOPIS OpenAPI ================= */

    private PfmLikeCalendarDTO.Item fetchDetailFromOpenApiWithRetry(String mt20id) throws Exception {
        // HTTPS 사용, mt20id만 인코딩, 서비스키는 인코딩하지 않음
        String url = "https://www.kopis.or.kr/openApi/restful/pblprfr/"
                + URLEncoder.encode(mt20id, StandardCharsets.UTF_8)
                + "?service=" + kopisApiKey;

        int maxTry = 3;
        for (int attempt = 1; attempt <= maxTry; attempt++) {
            try {
                PfmLikeCalendarDTO.Item parsed = callKopisAndParse(mt20id, url);
                if (parsed != null) return parsed;
            } catch (Exception e) {
                if (attempt == maxTry) throw e; // 최종 실패
            }
            // 지수 백오프: 0.3s, 0.6s
            Thread.sleep((long) (300 * Math.pow(2, attempt - 1)));
        }
        return minimalItem(mt20id);
    }

    private PfmLikeCalendarDTO.Item callKopisAndParse(String mt20id, String url) throws Exception {
        // 바이트로 받고 인코딩(EUC-KR/UTF-8) 판별
        ResponseEntity<byte[]> resp = restTemplate.exchange(url, HttpMethod.GET, null, byte[].class);
        byte[] body = resp.getBody();
        if (body == null || body.length == 0) return null;

        String head = new String(body, 0, Math.min(body.length, 256), StandardCharsets.ISO_8859_1);
        Charset cs = head.toUpperCase().contains("ENCODING=\"EUC-KR\"")
                ? Charset.forName("EUC-KR")
                : StandardCharsets.UTF_8;

        String xml = new String(body, cs);

        // XML 파싱
        Document doc = DocumentBuilderFactory.newInstance().newDocumentBuilder()
                .parse(new java.io.ByteArrayInputStream(xml.getBytes(cs)));
        doc.getDocumentElement().normalize();

        NodeList dbs = doc.getElementsByTagName("db");
        if (dbs.getLength() == 0) return null;

        Element first = (Element) dbs.item(0);

        // 상태 블록(returncode) 확인
        String returnCode = text(first, "returncode");
        if (returnCode != null && !returnCode.isBlank()) {
            if (!"00".equals(returnCode.trim())) {
                // 99 등 오류: 재시도 대상
                String errmsg = text(first, "errmsg");
                log.debug("KOPIS error returncode={} errmsg={} (mt20id={})", returnCode, errmsg, mt20id);
                return null;
            }
            // 일부 응답: 첫 db는 상태, 두 번째부터 실제 데이터
            if (dbs.getLength() >= 2) {
                first = (Element) dbs.item(1);
            } else {
                return null;
            }
        }

        String title  = text(first, "prfnm");
        String start  = normalizeDate(text(first, "prfpdfrom"));
        String end    = normalizeDate(text(first, "prfpdto"));
        String poster = text(first, "poster");

        return PfmLikeCalendarDTO.Item.builder()
                .id(mt20id)
                .pfm_doc_id(mt20id)
                .title(nvl(title))
                .start(nvl(start))
                .end(nvl(end))
                .poster(nvl(poster))
                .build();
    }

    /* ================= 유틸 ================= */

    private static PfmLikeCalendarDTO.Item minimalItem(String id) {
        return PfmLikeCalendarDTO.Item.builder()
                .id(id).pfm_doc_id(id).title(id).start("").end("").poster("")
                .build();
    }

    private static String text(Element e, String tag) {
        NodeList nl = e.getElementsByTagName(tag);
        if (nl.getLength() == 0) return "";
        Node n = nl.item(0);
        return n.getTextContent() == null ? "" : n.getTextContent().trim();
    }

    private static String nvl(String s) { return s == null ? "" : s; }

    // yyyy-MM-dd | yyyy.MM.dd | yyyyMMdd → yyyy-MM-dd
    private static String normalizeDate(String raw) {
        if (raw == null || raw.isBlank()) return "";
        List<String> patterns = List.of("yyyy-MM-dd", "yyyy.MM.dd", "yyyyMMdd");
        for (String p : patterns) {
            try {
                LocalDate d = LocalDate.parse(raw.trim(), DateTimeFormatter.ofPattern(p));
                return d.format(DateTimeFormatter.ISO_LOCAL_DATE);
            } catch (DateTimeParseException ignore) {}
        }
        // 점 제거 후 재시도
        String compact = raw.replaceAll("\\.", "");
        if (compact.matches("\\d{8}")) {
            try {
                LocalDate d = LocalDate.parse(compact, DateTimeFormatter.ofPattern("yyyyMMdd"));
                return d.format(DateTimeFormatter.ISO_LOCAL_DATE);
            } catch (Exception ignore) {}
        }
        return raw;
    }
}