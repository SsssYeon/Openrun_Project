import poster1 from "../components/poster1.jpg";
import poster2 from "../components/poster2.jpg";
import poster3 from "../components/poster3.jpg";

const eventsData = [
  {
    pfmcalender_doc_no: 1,
    pfmcalender_nm: "매디슨 카운티의 다리",
    pfmcalender_date: "2025-04-10",
    pfmcalender_time: "19:30",  // 시간이 별도 필드로 있으면 유지하거나 pfmcalender_date에 합쳐도 됩니다
    pfmcalender_today_cast: "차지연, 박은태",
    pfmcalender_seat: "2층 3열 6번",
    pfmcalender_cost: 80000,
    pfmcalender_bookingsite: "인터파크",  // 예시
    pfmcalender_memo: "감동적이었어요",
    pfmcalender_share: 0, // 0=나만보기, 1=공유하기 예시
    pfmcalender_timestamp: "2025-04-01T12:00:00" , // 예시, ISO 8601 형식
    pfmcalender_location: "광림아트센터 BBCH홀",
    pfmcalender_poster: poster3
  },
  {
    pfmcalender_doc_no: 2,
    pfmcalender_nm: "지킬앤하이드",
    pfmcalender_date: "2025-05-10",
    pfmcalender_time: "19:30",
    pfmcalender_today_cast: "",
    pfmcalender_seat: "1층 6열 17번",
    pfmcalender_cost: 130000,
    pfmcalender_bookingsite: "예스24",
    pfmcalender_memo: "",
    pfmcalender_share: 0,
    pfmcalender_timestamp: "2025-05-01T12:00:00",
    pfmcalender_location: "블루스퀘어 신한카드홀",
    pfmcalender_poster: poster1
  },
  {
    pfmcalender_doc_no: 3,
    pfmcalender_nm: "랭보",
    pfmcalender_date: "2025-05-22",
    pfmcalender_time: "18:00",
    pfmcalender_today_cast: "김리현, 김지철, 문경초",
    pfmcalender_seat: "C열 13번",
    pfmcalender_cost: 50000,
    pfmcalender_bookingsite: "인터파크",
    pfmcalender_memo: "",
    pfmcalender_share: 0,
    pfmcalender_timestamp: "2025-05-15T12:00:00",
    pfmcalender_location: "대학로 TOM",
    pfmcalender_poster: poster2
  },
  {
    pfmcalender_doc_no: 4,
    pfmcalender_nm: "랭보",
    pfmcalender_date: "2025-06-11",
    pfmcalender_time: "18:00",
    pfmcalender_today_cast: "박정원, 김경수, 문경초",
    pfmcalender_seat: "K열 10번",
    pfmcalender_cost: 30000,
    pfmcalender_bookingsite: "예스24",
    pfmcalender_memo: "",
    pfmcalender_share: 0,
    pfmcalender_timestamp: "2025-06-01T12:00:00",
    pfmcalender_location: "대학로 TOM",
    pfmcalender_poster: poster2
  }
];

export default eventsData;
