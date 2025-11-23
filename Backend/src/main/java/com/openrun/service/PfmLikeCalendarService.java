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
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

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

    @Value("${kopis.api.key}")
    private String kopisApiKey;

    /* ================= 공통: 토큰 → 사용자 문서ID 조회 ================= */

    private String extractToken(String authHeader) {
        if (authHeader == null || authHeader.isBlank()) return null;
        return authHeader.startsWith("Bearer ")
                ? authHeader.substring(7).trim()
                : authHeader.trim();
    }

    /*
     * Authorization 토큰으로 UserData 문서 ID를 반환.
     * - userAutoLoginToken == token
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

        return null;
    }

    /* ================= 공개 메서드 1: 전체 관심 공연(userLikeList) ================= */

    /*
     * 전체 관심 공연(userLikeList)을 KOPIS 상세로 채워 반환
     */
    public PfmLikeCalendarDTO getMyLikeEvents(String authHeader) throws Exception {
        String userDocId = getUserDocIdByToken(authHeader);
        if (userDocId == null) {
            return PfmLikeCalendarDTO.builder().userLikeList(Collections.emptyList()).build();
        }

        DocumentSnapshot userDoc = firestore.collection(USER_COLLECTION)
                .document(userDocId).get().get();

        List<String> likeIds = readStringList(userDoc, "userLikeList");

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

    /* ============ 공개 메서드 2: 달력 노출 3개(userPriorityLikeList) ============ */

    /*
     * 달력에 노출하도록 선택된 우선순위 관심 공연(userPriorityLikeList)만 반환
     */
    public PfmLikeCalendarDTO getMyPriorityLikeEvents(String authHeader) throws Exception {
        String userDocId = getUserDocIdByToken(authHeader);
        if (userDocId == null) {
            return PfmLikeCalendarDTO.builder().userLikeList(Collections.emptyList()).build();
        }

        DocumentSnapshot userDoc = firestore.collection(USER_COLLECTION)
                .document(userDocId).get().get();

        List<String> ids = readStringList(userDoc, "userPriorityLikeList");

        List<PfmLikeCalendarDTO.Item> items = new ArrayList<>();
        for (String mt20id : ids) {
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

    /* ================= KOPIS OpenAPI 호출/파싱 ================= */

    private PfmLikeCalendarDTO.Item fetchDetailFromOpenApiWithRetry(String mt20id) throws Exception {
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
                log.debug("KOPIS 재시도 {}/{} - {}: {}", attempt, maxTry, mt20id, e.getMessage());
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
        Document doc = DocumentBuilderFactory.newInstance()
                .newDocumentBuilder()
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

    /* ================= Firestore/유틸 ================= */

    /*
     * Firestore 문서에서 List<String> 형태로 안전하게 읽어오기
     */
    @SuppressWarnings("unchecked")
    private List<String> readStringList(DocumentSnapshot doc, String field) {
        if (doc == null || !doc.exists()) return Collections.emptyList();
        Object raw = doc.get(field);
        if (raw == null) return Collections.emptyList();

        List<String> out = new ArrayList<>();
        if (raw instanceof List<?> rawList) {
            for (Object o : rawList) {
                if (o == null) continue;
                String s = o.toString();
                if (s != null && !s.isBlank()) {
                    out.add(s.trim());
                }
            }
        } else if (raw instanceof String s) {
            if (!s.isBlank()) out.add(s.trim());
        }
        return out;
    }

    private static PfmLikeCalendarDTO.Item minimalItem(String id) {
        return PfmLikeCalendarDTO.Item.builder()
                .id(nvl(id))
                .pfm_doc_id(nvl(id))
                .title(nvl(id))
                .start("")
                .end("")
                .poster("")
                .build();
    }

    private static String text(Element e, String tag) {
        NodeList nl = e.getElementsByTagName(tag);
        if (nl.getLength() == 0) return "";
        Node n = nl.item(0);
        String content = (n.getTextContent() == null) ? "" : n.getTextContent().trim();
        return content;
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