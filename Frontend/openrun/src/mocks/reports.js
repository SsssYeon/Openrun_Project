import poster1 from "../components/poster1.jpg";
import poster2 from "../components/poster2.jpg";
import poster3 from "../components/poster3.jpg";

const reports = {
  total_view: 10,
  unique_pfm: 7,
  most_view_pfm: [
    { pfm_nm: "랭보", pfm_cnt: 4, pfm_poster: poster1 },
    { pfm_nm: "알라딘", pfm_cnt: 3, pfm_poster: poster2 },
    { pfm_nm: "심야식당", pfm_cnt: 2, pfm_poster: poster3 },
    { pfm_nm: "무인도 탈출기", pfm_cnt: 2 },
    { pfm_nm: "라흐헤스트", pfm_cnt: 2 },
  ],
  most_view_actor: [
    { actor_nm: "김이후", actor_cnt: 5 },
    { actor_nm: "이종석", actor_cnt: 3 },
    { actor_nm: "최재림", actor_cnt: 2 },
    { actor_nm: "차지연", actor_cnt: 2 },
    { actor_nm: "강홍석", actor_cnt: 2 },
    { actor_nm: "서경수", actor_cnt: 2 },
    { actor_nm: "박은태", actor_cnt: 1 },
  ],
};

export default reports;