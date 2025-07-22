import poster1 from "../components/poster1.jpg";
import poster2 from "../components/poster2.jpg";

const performancesData = [
  {
    pfm_doc_id: "1", // 공연ID
    pfm_nm: "지킬 앤 하이드", // 공연명
    pfm_start: "2025-05-10", // 시작일
    pfm_end: "2025-08-31", // 종료일
    pfm_fclty_nm: "블루스퀘어 신한카드홀", // 공연장
    pfm_cast: "홍광호, 전동석, 민우혁, 리사, 윤공주, 해나 외", // 출연진
    pfm_runtime: "170분 (인터미션 20분 포함)", // 런타임
    pfm_age: "만 13세 이상 관람가", // 관람연령
    pfm_mnfctr: "오디컴퍼니㈜", // 제작사
    pfm_cost: "VIP 150,000원 / R석 130,000원 / S석 100,000원 / A석 70,000원", // 가격
    pfm_poster: poster1, // 포스터
    pfm_sty: "선과 악, 두 인격 사이에서 갈등하는 지킬 박사의 이야기를 그린 뮤지컬로, 인간의 본성과 도덕성에 대한 깊은 성찰을 담고 있다.", // 줄거리
    pfm_genre: "뮤지컬", // 장르
    pfm_dt: "화-금 19:30 / 토 14:00, 19:00 / 일 14:00 (월요일 공연 없음)", // 공연시간
  },
  {
    pfm_doc_id: "2",
    pfm_nm: "랭보",
    pfm_start: "2025-09-10",
    pfm_end: "2025-12-01",
    pfm_fclty_nm: "드림아트센터 1관",
    pfm_cast: "윤형렬, 박영수, 김성규, 박유덕, 정동화 외",
    pfm_runtime: "110분 (인터미션 없음)",
    pfm_age: "만 13세 이상 관람가",
    pfm_mnfctr: "라이브㈜",
    pfm_cost: "R석 77,000원 / S석 55,000원",
    pfm_poster: poster2,
    pfm_sty: "자유를 갈망했던 천재 시인 랭보와 시인 베를렌느의 만남과 갈등을 다룬 창작 뮤지컬. 불꽃 같은 젊음과 문학적 열정을 그린 작품이다.",
    pfm_genre: "뮤지컬",
    pfm_dt: "화-금 20:00 / 토 15:00, 19:00 / 일·공휴일 14:00, 18:00 (월요일 공연 없음)",
  }
];

export default performancesData;
