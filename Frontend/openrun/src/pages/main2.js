// 홈 2번째 화면, 최근 커뮤니티 글 api 연결 완료
// 오픈런 랭킹, 오픈런 추천 공연 어떻게 할지 결정 필요. 결정 후 수정 필요한 부분 수정 예정

import React, { useEffect, useState } from "react";
import "../css/main2.css"; // CSS 파일 연결
import poster1 from "../components/poster1.jpg";
import poster2 from "../components/poster2.jpg";
import poster3 from "../components/poster3.jpg";
import poster4 from "../components/poster4.jpg";
import poster5 from "../components/poster5.jpeg";
import poster6 from "../components/poster6.jpg";

import logo from "../components/logo2.png";

const fallbackRanking = [
  {
    pfm_doc_id: 1,
    pfm_nm: "지킬앤하이드",
    pfm_start: "2024.11.29",
    pfm_end: "2025.05.18",
    pfm_poster: poster1,
  },
  {
    pfm_doc_id: 2,
    pfm_nm: "랭보",
    pfm_start: "2022.02.19",
    pfm_end: "2025.05.18",
    pfm_poster: poster2,
  },
  {
    pfm_doc_id: 3,
    pfm_nm: "메디슨 카운티의 다리",
    pfm_start: "2025.05.01",
    pfm_end: "2025.07.13",
    pfm_poster: poster3,
  },
];

const fallbackRecommend = [
  {
    pfm_doc_id: 1,
    catchphrase: "우린 왜 그냥 스쳐 가지 않고 \n서로를 바라봤을까",
    pfm_poster: poster4,
  },
  {
    pfm_doc_id: 2,
    catchphrase: "누군가 이 세상을 \n바로잡아야 한다",
    pfm_poster: poster5,
  },
  {
    pfm_doc_id: 3,
    catchphrase: "No day\nBut today",
    pfm_poster: poster6,
  },
];

const fallbackCommunity = [
  {
    postDocumentId: "post_001",

    userId: "user_20240901",

    userNickname: "오픈런_마스터",

    postTitle: "뮤지컬 '헤드윅' 2층 중앙 시야 후기 및 꿀팁 공유",

    postContent:
      "헤드윅 2024년 시즌 2층 A열 중앙 시야 후기입니다. 생각보다 무대가 잘 보였고, 전반적인 연출을 한눈에 담을 수 있었습니다. 오츠카(망원경) 없이도 충분히 볼만했어요. 다만 배우 표정 디테일은 조금 아쉬웠습니다. 커튼콜 때 사진 찍기 좋은 앵글도 공유합니다!",

    postContentSummary:
      "헤드윅 2024년 시즌 2층 A열 중앙 시야 후기입니다. 생각보다 무대가 잘 보...",

    postTag: ["공연 후기", "공연 정보"],

    postTimeStamp: "2025-05-01T10:00:00Z",

    commentCount: 15,

    postImage: [poster1, poster2],
  },

  {
    postDocumentId: "post_002",

    userId: "user_19991231",

    userNickname: "덕질러_제인",

    postTitle: "연극 '리어왕'을 보고 느낀점: 시대와 인간 본질에 대한 탐구",

    postContent:
      "리어왕을 처음 접했는데, 셰익스피어의 고전이 주는 무게감이 엄청나네요. 특히 주연 배우의 광기 어린 연기가 압권이었습니다. 조명과 무대 장치도 극의 분위기를 잘 살려주었고, 4시간이 짧게 느껴질 정도로 몰입했습니다. 다음 관람 때는 원작을 읽고 가야겠어요.",

    postContentSummary:
      "리어왕을 처음 접했는데, 셰익스피어의 고전이 주는 무게감이 엄청나네요. 특...",

    postTag: ["공연 후기"],

    postTimeStamp: "2025-05-01T15:30:00Z",

    commentCount: 7,

    postImage: [],
  },
];

const dateTimeOptions = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
};

const Main2 = () => {
  const [rankingData, setRankingData] = useState(fallbackRanking);
  const [recommendData, setRecommendData] = useState(fallbackRecommend);
  const [latestPosts, setLatestPosts] = useState(fallbackCommunity);

  useEffect(() => {
    // 랭킹 데이터 요청
    fetch(`/api/performances/ranking`)
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
    fetch(`/api/performances/recommend`)
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

  // 최근 커뮤니티 글 요청
  fetch(`/api/community/latest`)
    .then((res) => {
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    })
    .then((data) => {
      // 서버 응답이 배열 형태라고 가정합니다.
      if (Array.isArray(data)) setLatestPosts(data);
    })
    .catch(() => {
      setLatestPosts(fallbackCommunity);
    });

  return (
    <div className="main2-container">
      <div className="layout">
        <div className="left">
          <div className="section-title">
            <h3 id="left-title">오픈런 랭킹</h3>
          </div>
          <div className="ranking section">
            {rankingData.map((item, index) => (
              <div className="ranking-item" key={item.pfm_doc_id ?? index}>
                <div className="rank-num">{index + 1}</div>
                <div className="ranking-info">
                  <div className="title">{item.pfm_nm}</div>
                  <div className="date">
                    {item.pfm_start} ~ {item.pfm_end}
                  </div>
                </div>
                <img src={item.pfm_poster} alt={`${item.pfm_nm} 포스터`} />
              </div>
            ))}
          </div>
        </div>

        <div className="right-top">
          <h3 id="righttop-title">오픈런 추천 공연</h3>

          <div className="recommend-list">
            {recommendData.map((item, index) => (
              <div className="recommend-card" key={item.pfm_id ?? index}>
                <img src={item.pfm_poster} alt={`${index}번째 포스터`} />
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
            {latestPosts.map((item) => (
              <div className="main2-community-item" key={item.postDocumentId}>
                <div className="content">
                  <div className="title">
                    {item.postTitle.length > 30
                      ? item.postTitle.slice(0, 29) + "..."
                      : item.postTitle}
                  </div>

                  <div className="subtext">
                    {item.postContent.length > 30
                      ? item.postContent.slice(0, 29) + "..."
                      : item.postContent}
                  </div>
                </div>

                <div className="date">
                  {new Date(item.postTimeStamp).toLocaleString(
                    "ko-KR",
                    dateTimeOptions
                  )}
                </div>
                <img
                  src={
                    Array.isArray(item.postImage) && item.postImage.length > 0
                      ? item.postImage[0]
                      : logo
                  }
                  alt={item.postTitle}
                  className="thumb"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = logo;
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="banner">
          <h3 id="title">
            테스트 배포 중 입니다! 많은 피드백 주시면 감사하겠습니다 :){" "}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default Main2;
