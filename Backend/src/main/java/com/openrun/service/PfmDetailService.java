package com.openrun.service;

import com.openrun.dto.PfmDetailDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.w3c.dom.*;

import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;

@Service
@Slf4j
public class PfmDetailService {

    private static final String API_KEY = "9b94400380474e0fb9f38a047c6b728e".trim();
    private static final String DETAIL_URL = "http://www.kopis.or.kr/openApi/restful/pblprfr/";

    // 외부에서 쓰는 상세 조회 캐시 적용
    @Cacheable(value = "pfmDetail", key = "#id")
    public PfmDetailDto getPerformanceDetail(String id) throws Exception {
        return fetchDetailFromApi(id);
    }

    // 증분동기화/내부용은 캐시 없이 호출
    public PfmDetailDto fetchDetailFromApi(String id) throws Exception {
        String urlStr = DETAIL_URL + id + "?service=" + API_KEY;

        HttpURLConnection conn = openConnection(urlStr);
        byte[] body = conn.getInputStream().readAllBytes();
        if (body == null || body.length == 0) return null;

        Charset cs = detectCharset(body);
        Document doc = DocumentBuilderFactory.newInstance()
                .newDocumentBuilder()
                .parse(new ByteArrayInputStream(body));
        doc.getDocumentElement().normalize();

        NodeList list = doc.getElementsByTagName("db");
        if (list.getLength() == 0) return null;

        Element elem = (Element) list.item(0);

        PfmDetailDto dto = new PfmDetailDto();
        dto.setMt20id(getTagValue("mt20id", elem));
        dto.setPrfnm(getTagValue("prfnm", elem));
        dto.setPrfpdfrom(getTagValue("prfpdfrom", elem));
        dto.setPrfpdto(getTagValue("prfpdto", elem));
        dto.setFcltynm(getTagValue("fcltynm", elem));
        dto.setPrfcast(getTagValue("prfcast", elem));
        dto.setPrfruntime(getTagValue("prfruntime", elem));
        dto.setPrfage(getTagValue("prfage", elem));
        dto.setEntrpsnmP(getTagValue("entrpsnmP", elem));
        dto.setPcseguidance(getTagValue("pcseguidance", elem));
        dto.setPoster(getTagValue("poster", elem));
        dto.setSty(getTagValue("sty", elem));
        dto.setGenrenm(getTagValue("genrenm", elem));
        dto.setDtguidance(getTagValue("dtguidance", elem));

        return dto;
    }

    private HttpURLConnection openConnection(String urlStr) throws Exception {
        URL url = new URL(urlStr);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("User-Agent", "Mozilla/5.0");
        conn.setRequestProperty("Accept-Encoding", "gzip");
        conn.setConnectTimeout(5000);
        conn.setReadTimeout(7000);
        return conn;
    }

    private static String getTagValue(String tag, Element elem) {
        NodeList nodeList = elem.getElementsByTagName(tag);
        if (nodeList.getLength() == 0) return "";
        Node n = nodeList.item(0);
        return n.getTextContent() == null ? "" : n.getTextContent().trim();
    }

    private Charset detectCharset(byte[] body) {
        String head = new String(body, 0, Math.min(body.length, 256), StandardCharsets.ISO_8859_1).toUpperCase();
        return head.contains("ENCODING=\"EUC-KR\"") ? Charset.forName("EUC-KR") : StandardCharsets.UTF_8;
    }
}