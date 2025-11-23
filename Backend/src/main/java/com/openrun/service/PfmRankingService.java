package com.openrun.service;

import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.openrun.dto.PfmRankingDTO;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.CollectionReference;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@Service
public class PfmRankingService {

    private final Firestore firestore;

    public PfmRankingService(Firestore firestore) {
        this.firestore = firestore;
    }

    /**랭킹 정보 가져오기**/
    public List<PfmRankingDTO> getThisWeekRanking() {
        try {
            // 이번 주 월요일 날짜 문서 이름
            LocalDate today = LocalDate.now();
            LocalDate monday = today.minusDays(today.getDayOfWeek().getValue() - 1);
            //String docId = monday.format(DateTimeFormatter.ISO_DATE); // "2025-11-10"
            String docId = "2025-11-10";

            CollectionReference rankingCol = firestore.collection("WeeklyPfmRanking");
            DocumentSnapshot docSnap = rankingCol.document(docId).get().get();

            if (!docSnap.exists()) return new ArrayList<>();

            List<Map<String, Object>> rankingList = (List<Map<String, Object>>) docSnap.get("ranking");
            List<PfmRankingDTO> result = new ArrayList<>();

            for (Map<String, Object> item : rankingList) {
                PfmRankingDTO dto = new PfmRankingDTO();
                dto.setPfm_doc_id((String) item.get("pfm_doc_id"));
                dto.setPfm_nm((String) item.get("pfm_nm"));
                dto.setPfm_start((String) item.get("pfm_start"));
                dto.setPfm_end((String) item.get("pfm_end"));
                dto.setPfm_poster((String) item.get("pfm_poster"));
                dto.setRegCnt(((Number) item.get("regCnt")).intValue());
                result.add(dto);
            }

            return result;

        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    /**월요일마다 랭킹 DB 업데이트**/
    // 테스트용: 실행할 때마다 랭킹 생성
    public void generateWeeklyRanking() {
        try {
            LocalDate today = LocalDate.now();
            LocalDate monday = today.minusDays(today.getDayOfWeek().getValue() - 1);
            LocalDate sunday = monday.plusDays(6);
            DateTimeFormatter df = DateTimeFormatter.ofPattern("yyyy-MM-dd");

            CollectionReference recordCol = firestore.collection("RecordData");
            List<QueryDocumentSnapshot> documents = recordCol.get().get().getDocuments();

            Map<String, Map<String, Object>> rankingMap = new HashMap<>();

            for (DocumentSnapshot doc : documents) {
                String dateStr = doc.getString("pfmcalender_date");
                LocalDate date = LocalDate.parse(dateStr, df);

                if (!date.isBefore(monday) && !date.isAfter(sunday)) {
                    String pfmName = doc.getString("pfmcalender_nm");
                    Map<String, Object> perf = rankingMap.getOrDefault(pfmName, new HashMap<>());
                    int prevCount = (int) perf.getOrDefault("count", 0);

                    perf.put("pfm_nm", pfmName);
                    perf.put("pfm_doc_id", doc.getString("mt20id"));
                    perf.put("pfm_start", doc.getString("pfmcalender_date"));
                    perf.put("pfm_end", doc.getString("pfmcalender_date"));
                    perf.put("pfm_poster", doc.getString("pfmcalender_poster"));
                    perf.put("count", prevCount + 1);

                    rankingMap.put(pfmName, perf);
                }
            }

            List<Map<String, Object>> rankingList = new ArrayList<>(rankingMap.values());
            rankingList.sort((a, b) -> ((Integer) b.get("count")).compareTo((Integer) a.get("count")));

            if (rankingList.size() > 3) {
                rankingList = rankingList.subList(0, 3);
            }

            CollectionReference rankingCol = firestore.collection("WeeklyPfmRanking");
            String docId = monday.format(DateTimeFormatter.ISO_DATE);
            Map<String, Object> docData = new HashMap<>();
            docData.put("ranking", rankingList);

            rankingCol.document(docId).set(docData).get();
            System.out.println("Weekly ranking saved for week: " + docId);

        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        }
    }
}