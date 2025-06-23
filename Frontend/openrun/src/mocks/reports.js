import poster1 from "../components/poster1.jpg";
import poster2 from "../components/poster2.jpg";
import poster3 from "../components/poster3.jpg";

const reports = {
  totalViewCount: 10,
  totalWorksCount: 7,
  frequentWorks: [
    { title: "랭보", count: 4, poster: poster1 },
    { title: "알라딘", count: 3, poster: poster2 },
    { title: "심야식당", count: 2, poster: poster3 },
    { title: "무인도 탈출기", count: 2 },
    { title: "라흐헤스트", count: 2 },
  ],
  frequentActors: [
    { name: "김이후", count: 5 },
    { name: "이종석", count: 3 },
    { name: "최재림", count: 2 },
    { name: "차지연", count: 2 },
    { name: "강홍석", count: 2 },
    { name: "서경수", count: 2 },
    { name: "박은태", count: 1 },
  ],
};

export default reports;