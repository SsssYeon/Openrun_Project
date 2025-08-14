// 홈 2번째 화면, api 연결 필요

import React, { useEffect, useState } from "react";
import "../css/main2.css"; // CSS 파일 연결
import poster1 from "../components/poster1.jpg";
import poster2 from "../components/poster2.jpg";
import poster3 from "../components/poster3.jpg";
import logo2 from "../components/logo2.png";

const fallbackRanking = [
  {
    id: 1,
    title: "지킬앤하이드",
    date: "2024.11.29 ~ 2025.05.18",
    image: poster1,
  },
  {
    id: 2,
    title: "랭보",
    date: "2025.02.19 ~ 2025.05.18",
    image: poster2,
  },
  {
    id: 3,
    title: "메디슨 카운티의 다리",
    date: "2025.05.01 ~ 2025.07.13",
    image: poster3,
  },
];

const fallbackRecommend = [
  {
    id: 1,
    catchphrase: "지금 이 순간, \n끝나지 않는 신화",
    image: poster1,
  },
  {
    id: 2,
    catchphrase: "그리하여 나는 벗어난다\n세상 모든 것으로부터",
    image: poster2,
  },
  {
    id: 3,
    catchphrase: "기나긴 시간을 건너,\n단 한 번의 순간",
    image: poster3,
  },
];

const Main2 = () => {
  const [rankingData, setRankingData] = useState(fallbackRanking);
  const [recommendData, setRecommendData] = useState(fallbackRecommend);

  useEffect(() => {
    // 랭킹 데이터 요청
    fetch("/api/performances/ranking")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setRankingData(data);
      })
      .catch(() => {
        setRankingData(fallbackRanking);
      });

    // 추천 공연 요청
    fetch("/api/performances/recommend")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setRecommendData(data);
      })
      .catch(() => {
        setRecommendData(fallbackRecommend);
      });
  }, []);

  return (
    <div className="main2-container">
      <div className="layout">
        <div className="left">
          <div className="section-title">
            <h3 id="left-title">오픈런 랭킹</h3>
          </div>
          <div className="ranking section">
            {rankingData.map((item, index) => (
              <div className="ranking-item" key={item.id ?? index}>
                <div className="rank-num">{index + 1}</div>
                <div className="ranking-info">
                  <div className="title">{item.title}</div>
                  <div className="date">{item.date}</div>
                </div>
                <img src={item.image} alt={`${item.title} 포스터`} />
              </div>
            ))}
          </div>
        </div>

        <div className="right-top">
          <h3 id="righttop-title">오픈런 추천 공연</h3>

          <div className="recommend-list">
            {recommendData.map((item, index) => (
              <div className="recommend-card" key={item.id ?? index}>
                <img src={item.image} alt={`${index}번째 포스터`} />
                <div className="card-text">
                  <div className="catchphrase">
                    {item.catchphrase.split("\n").map((line, idx) => (
                      <React.Fragment key={idx}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="right-bottom">
          <h3 id="rightbottom-title">최근 커뮤니티 글</h3>

          <div className="main2-community-list">
            <h4 id ="mypage-notice"> 추후 구현 예정입니다! </h4>
            {/* <div className="main2-community-item">
              <div className="content">
                <div className="title">지킬앤하이드 후기</div>
                <div className="subtext">지킬을 보고 왔습니다...</div>
              </div>
              <div className="date">25.05.01</div>
              <img src={poster1} alt="썸네일" className="thumb" />
            </div>

            <div className="main2-community-item">
              <div className="content">
                <div className="title">링아센 좌석 후기</div>
                <div className="subtext">
                  가성비석 다녀왔습니다! 시야는 좋은데 음향이...
                </div>
              </div>
              <div className="date">25.03.29</div>
              <img src={logo2} alt="썸네일" className="thumb" />
            </div> */}
          </div>
        </div>

        <div className="banner">
          <h3 id="title">테스트 배포 중 입니다! 많은 피드백 주시면 감사하겠습니다 :) </h3>
        </div>
      </div>
    </div>
  );
};

export default Main2;