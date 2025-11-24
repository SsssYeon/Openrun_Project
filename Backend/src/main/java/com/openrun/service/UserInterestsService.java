package com.openrun.service;

import com.google.cloud.firestore.*;
import com.openrun.dto.InterestsResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.w3c.dom.*;

import javax.xml.parsers.DocumentBuilderFactory;
import java.net.URLEncoder;
import java.nio.charset.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ExecutionException;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserInterestsService {

    private static final String USER_COLLECTION = "UserData";
    private static final String PERF_COLLECTION = "Kopis_performances_detail";

    private final Firestore firestore;
    private final RestTemplate restTemplate;

    @Value("${kopis.api.key}")
    private String kopisApiKey;

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

        Map<String, InterestsResponse.Item> localCache = new HashMap<>();

        List<InterestsResponse.Item> likeItems = new ArrayList<>();
        for (String id : likeIds) {
            if (id==null || id.isBlank()) continue;
            likeItems.add(localCache.computeIfAbsent(id, this::safeFetch));
        }

        List<InterestsResponse.Item> priorityItems = new ArrayList<>();
        for (String id : priorityIds) {
            if (id==null || id.isBlank()) continue;
            priorityItems.add(localCache.computeIfAbsent(id, this::safeFetch));
        }

        return InterestsResponse.builder()
                .userLikeList(likeItems)
                .userPriorityLikeList(priorityItems)
                .build();
    }

    private InterestsResponse.Item safeFetch(String id) {
        try {
            // 1) Firestore 캐시 먼저
            InterestsResponse.Item fromDb = fetchFromFirestore(id);
            if (fromDb != null) return fromDb;

            // 2) 없으면 API(요청 간 캐시 적용)
            return fetchDetailFromApiCached(id);
        } catch (Exception e) {
            log.warn("관심공연 조회 실패 {}: {}", id, e.toString());
            return minimal(id);
        }
    }

    private InterestsResponse.Item fetchFromFirestore(String id) {
        try {
            DocumentSnapshot snap = firestore.collection(PERF_COLLECTION).document(id).get().get();
            if (!snap.exists()) return null;

            String title = nvl(snap.getString("prfnm"));
            String start = normalizeDate(nvl(snap.getString("prfpdfrom")));
            String end = normalizeDate(nvl(snap.getString("prfpdto")));
            String poster = nvl(snap.getString("poster"));

            return InterestsResponse.Item.builder()
                    .id(id).pfm_doc_id(id)
                    .title(title).start(start).end(end).poster(poster)
                    .build();
        } catch (Exception e) {
            return null;
        }
    }

    @Cacheable(value = "pfmDetail", key = "#id")
    public InterestsResponse.Item fetchDetailFromApiCached(String id) throws Exception {
        String url="https://www.kopis.or.kr/openApi/restful/pblprfr/"
                + URLEncoder.encode(id, StandardCharsets.UTF_8)
                + "?service=" + kopisApiKey;

        ResponseEntity<byte[]> resp = restTemplate.exchange(url, HttpMethod.GET, null, byte[].class);
        byte[] body = resp.getBody();
        if (body==null || body.length==0) return minimal(id);

        Charset cs = detectCharset(body);
        Document doc = DocumentBuilderFactory.newInstance().newDocumentBuilder()
                .parse(new java.io.ByteArrayInputStream(body));
        doc.getDocumentElement().normalize();

        NodeList dbs = doc.getElementsByTagName("db");
        if (dbs.getLength()==0) return minimal(id);

        Element first=(Element) dbs.item(0);

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

    private Charset detectCharset(byte[] body) {
        String head = new String(body, 0, Math.min(body.length, 256), StandardCharsets.ISO_8859_1).toUpperCase();
        return head.contains("ENCODING=\"EUC-KR\"") ? Charset.forName("EUC-KR") : StandardCharsets.UTF_8;
    }
}