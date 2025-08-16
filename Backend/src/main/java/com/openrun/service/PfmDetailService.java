package com.openrun.service;

import com.openrun.dto.PfmDetailDto;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilderFactory;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@Service
public class PfmDetailService {

    private static final String API_KEY = "9b94400380474e0fb9f38a047c6b728e";
    private static final String DETAIL_URL = "http://www.kopis.or.kr/openApi/restful/pblprfr/";

    public PfmDetailDto getPerformanceDetail(String id) throws Exception {
        String urlStr = DETAIL_URL + id + "?service=" + API_KEY;
        System.out.println("📄 공연 상세 요청 URL: " + urlStr);

        URL url = new URL(urlStr);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");

        BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream(), "UTF-8"));
        StringBuilder responseBuilder = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            responseBuilder.append(line).append("\n");
        }
        reader.close();

        String xml = responseBuilder.toString();
        System.out.println("📦 API 원본 응답:\n" + xml);

        InputStream xmlStream = new java.io.ByteArrayInputStream(xml.getBytes("UTF-8"));
        Document doc = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(xmlStream);
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

    private static String getTagValue(String tag, Element elem) {
        NodeList nodeList = elem.getElementsByTagName(tag);
        if (nodeList.getLength() == 0 || nodeList.item(0).getTextContent() == null) return "";
        return nodeList.item(0).getTextContent();
    }
}