import poster1 from "../components/poster1.jpg";
import poster2 from "../components/poster2.jpg";
import poster3 from "../components/poster3.jpg";

const favorites = [
    {
    id: "1",
    pfm_doc_id: "1",
    title: "지킬 앤 하이드",
    start: "2025-05-03",
    end: "2025-07-09", // 종료일 다음날로 설정
    poster: poster1,
    className: 'favorite-1',
    is_main_favorite : true,
  },
  {
    id: "2",
    pfm_doc_id: "2",
    title: "랭보",
    start: "2025-06-04",
    end: "2025-08-06", // 종료일 다음날로 설정
    poster: poster2,
    className: 'favorite-2',
  },
  {
    id: "3",
    pfm_doc_id: "1",
    title: "매디슨 카운티의 다리",
    start: "2025-06-04",
    end: "2025-06-22", // 종료일 다음날로 설정
    poster: poster3,
    className: 'favorite-3',
  },
  
];

export default favorites;