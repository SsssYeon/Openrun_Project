// src/main/java/com/openrun/service/UserInterestsService.java
package com.openrun.service;

import com.google.cloud.firestore.*;
import com.openrun.dto.InterestsResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.w3c.dom.*;
import javax.xml.parsers.DocumentBuilderFactory;
import java.net.URLEncoder;
import java.nio.charset.*;
import java.time.LocalDate;
import java.time.format.*;
import java.util.*;
import java.util.concurrent.ExecutionException;

@Service @RequiredArgsConstructor @Slf4j
public class UserInterestsService {
    private static final String USER_COLLECTION="UserData";
    private final Firestore firestore;
    private final org.springframework.web.client.RestTemplate restTemplate;
    @Value("${kopis.api.key}") private String kopisApiKey;

    private String extractToken(String h){
        if(h==null||h.isBlank()) return null;
        return h.startsWith("Bearer ")?h.substring(7).trim():h.trim();
    }
    private String getUserDocIdByToken(String auth) throws ExecutionException,InterruptedException{
        String t=extractToken(auth); if(t==null||t.isBlank()) return null;
        QuerySnapshot qs = firestore.collection(USER_COLLECTION)
                .whereEqualTo("userAutoLoginToken", t)
                .limit(1).get().get();
        return qs.isEmpty()? null : qs.getDocuments().get(0).getId();
    }

    public InterestsResponse getAllInterestsWithFlag(String auth) throws Exception {
        String uid = getUserDocIdByToken(auth);
        if (uid==null) {
            return InterestsResponse.builder()
                    .userLikeList(Collections.emptyList())
                    .userPriorityLikeList(Collections.emptyList())
                    .build();
        }

        DocumentSnapshot doc = firestore.collection(USER_COLLECTION).document(uid).get().get();

        @SuppressWarnings("unchecked")
        List<String> likeIds = doc.exists()? (List<String>) doc.get("userLikeList") : Collections.emptyList();
        @SuppressWarnings("unchecked")
        List<String> priorityIds = doc.exists()? (List<String>) doc.get("userPriorityLikeList") : Collections.emptyList();
        if (likeIds==null) likeIds = Collections.emptyList();
        if (priorityIds==null) priorityIds = Collections.emptyList();

        // OpenAPI 호출 중복 방지 캐시
        Map<String, InterestsResponse.Item> cache = new HashMap<>();

        // 1) 전체 관심 공연 배열
        List<InterestsResponse.Item> likeItems = new ArrayList<>();
        for (String id : likeIds) {
            if (id==null || id.isBlank()) continue;
            try {
                InterestsResponse.Item item = cache.computeIfAbsent(id, this::safeFetch);
                likeItems.add(item);
            } catch (Exception e) {
                likeItems.add(minimal(id));
            }
        }

        // 2) 우선 관심 공연 배열
        List<InterestsResponse.Item> priorityItems = new ArrayList<>();
        for (String id : priorityIds) {
            if (id==null || id.isBlank()) continue;
            try {
                InterestsResponse.Item item = cache.computeIfAbsent(id, this::safeFetch);
                priorityItems.add(item);
            } catch (Exception e) {
                priorityItems.add(minimal(id));
            }
        }

        return InterestsResponse.builder()
                .userLikeList(likeItems)
                .userPriorityLikeList(priorityItems)
                .build();
    }

    /* 캐시 computeIfAbsent용 안전 래퍼 */
    private InterestsResponse.Item safeFetch(String id) {
        try { return fetchDetail(id); }
        catch (Exception e) {
            log.warn("KOPIS 조회 실패 {}: {}", id, e.toString());
            return minimal(id);
        }
    }

    /* 상세 채워 반환 */
    private InterestsResponse.Item fetchDetail(String id) throws Exception {
        String url="https://www.kopis.or.kr/openApi/restful/pblprfr/"
                + URLEncoder.encode(id, StandardCharsets.UTF_8)
                + "?service=" + kopisApiKey;

        ResponseEntity<byte[]> resp = restTemplate.exchange(url, HttpMethod.GET, null, byte[].class);
        byte[] body = resp.getBody(); if (body==null || body.length==0) return minimal(id);

        String head = new String(body, 0, Math.min(body.length, 256), StandardCharsets.ISO_8859_1);
        Charset cs = head.toUpperCase().contains("ENCODING=\"EUC-KR\"") ? Charset.forName("EUC-KR") : StandardCharsets.UTF_8;
        String xml = new String(body, cs);

        Document doc = DocumentBuilderFactory.newInstance().newDocumentBuilder()
                .parse(new java.io.ByteArrayInputStream(xml.getBytes(cs)));
        doc.getDocumentElement().normalize();
        NodeList dbs = doc.getElementsByTagName("db");
        if (dbs.getLength()==0) return minimal(id);

        Element first=(Element) dbs.item(0);
        String rc = text(first,"returncode");
        if (rc!=null && !rc.isBlank()){
            if (!"00".equals(rc.trim())) return minimal(id);
            if (dbs.getLength()>=2) first=(Element) dbs.item(1);
            else return minimal(id);
        }

        String title = text(first,"prfnm");
        String start = normalizeDate(text(first,"prfpdfrom"));
        String end   = normalizeDate(text(first,"prfpdto"));
        String poster= text(first,"poster");

        return InterestsResponse.Item.builder()
                .id(id).pfm_doc_id(id).title(nvl(title))
                .start(nvl(start)).end(nvl(end)).poster(nvl(poster))
                .build();
    }

    private static InterestsResponse.Item minimal(String id){
        return InterestsResponse.Item.builder()
                .id(id).pfm_doc_id(id).title(id)
                .start("").end("").poster("")
                .build();
    }

    private static String text(Element e,String tag){
        NodeList nl = e.getElementsByTagName(tag);
        if (nl.getLength()==0) return "";
        Node n = nl.item(0);
        return n.getTextContent()==null ? "" : n.getTextContent().trim();
    }
    private static String nvl(String s){ return s==null? "": s; }

    private static String normalizeDate(String raw){
        if (raw==null || raw.isBlank()) return "";
        List<String> p = List.of("yyyy-MM-dd","yyyy.MM.dd","yyyyMMdd");
        for (String f : p){
            try {
                LocalDate d = LocalDate.parse(raw.trim(), DateTimeFormatter.ofPattern(f));
                return d.format(DateTimeFormatter.ISO_LOCAL_DATE);
            } catch (Exception ignore) {}
        }
        String c = raw.replaceAll("\\.","");
        if (c.matches("\\d{8}")){
            try {
                LocalDate d = LocalDate.parse(c, DateTimeFormatter.ofPattern("yyyyMMdd"));
                return d.format(DateTimeFormatter.ISO_LOCAL_DATE);
            } catch (Exception ignore) {}
        }
        return raw;
    }
}