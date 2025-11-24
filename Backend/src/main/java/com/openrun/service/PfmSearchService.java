package com.openrun.service;

import com.openrun.dto.PfmSearchDto;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilderFactory;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URLEncoder;
import java.net.URL;
import java.util.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class PfmSearchService {

    private static final String API_KEY = "9b94400380474e0fb9f38a047c6b728e".trim();
    private static final String BASE_URL = "http://www.kopis.or.kr/openApi/restful/pblprfr";

    public List<PfmSearchDto> searchPerformancesFromApi(String query) throws Exception {
        return fetchWithSeoulRegionAndFilteredGenre(query);
    }

    private List<PfmSearchDto> fetchWithSeoulRegionAndFilteredGenre(String query) throws Exception {
        List<PfmSearchDto> results = new ArrayList<>();
        Set<String> seenIds = new HashSet<>();
        String encodedQuery = URLEncoder.encode(query, "UTF-8");

        // 오늘 기준 +1년 ~ -3년
        LocalDate today = LocalDate.now();
        String stdate = today.minusYears(3).format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String eddate = today.plusYears(1).format(DateTimeFormatter.ofPattern("yyyyMMdd"));

        int cpage = 1;
        final int rows = 100;

        while (true) {
            String urlStr = BASE_URL +
                    "?service=" + API_KEY +
                    "&cpage=" + cpage +
                    "&rows=" + rows +
                    "&shprfnm=" + encodedQuery +
                    "&signgucode=11" + // 서울
                    "&stdate=" + stdate +
                    "&eddate=" + eddate;

            System.out.println("요청 URL: " + urlStr);

            URL url = new URL(urlStr);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("User-Agent", "Mozilla/5.0");

            BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream(), "UTF-8"));
            StringBuilder responseBuilder = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                responseBuilder.append(line).append("\n");
            }
            reader.close();

            String xml = responseBuilder.toString();
            System.out.println("API 원본 응답:\n" + xml);

            InputStream xmlStream = new java.io.ByteArrayInputStream(xml.getBytes("UTF-8"));
            Document doc = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(xmlStream);
            doc.getDocumentElement().normalize();

            NodeList list = doc.getElementsByTagName("db");
            if (list.getLength() == 0) break;

            for (int i = 0; i < list.getLength(); i++) {
                var elem = (org.w3c.dom.Element) list.item(i);

                String id = getTagValue("mt20id", elem);
                String name = getTagValue("prfnm", elem);
                String genre = getTagValue("genrenm", elem);
                String start = getTagValue("prfpdfrom", elem);
                String end   = getTagValue("prfpdto", elem);


                if (id != null && !id.isBlank()
                        && name != null && !name.isBlank()
                        && genre != null
                        && (genre.contains("뮤지컬") || genre.contains("연극"))
                        && seenIds.add(id)) {

                    PfmSearchDto dto = new PfmSearchDto();
                    dto.setPfm_doc_id(id);
                    dto.setPfm_nm(name);
                    dto.setPfm_start(start == null ? "" : start);
                    dto.setPfm_end(end == null ? "" : end);
                    results.add(dto);
                }
            }

            if (list.getLength() < rows) break;
            cpage++;
        }

        return results;
    }

    private static String getTagValue(String tag, org.w3c.dom.Element elem) {
        NodeList nodeList = elem.getElementsByTagName(tag);
        if (nodeList.getLength() == 0 || nodeList.item(0).getTextContent() == null) return "";
        return nodeList.item(0).getTextContent();
    }
}