// 홈 2번째 화면, 최근 커뮤니티 글 api 연결 완료
// 오픈런 랭킹, 오픈런 추천 공연 어떻게 할지 결정 필요. 결정 후 수정 필요한 부분 수정 예정

import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "../css/main2.css"; // CSS 파일 연결
import poster7 from "../components/poster7.png";
import poster8 from "../components/poster8.gif";
import poster3 from "../components/poster3.jpg";
import poster4 from "../components/poster4.jpg";
import poster5 from "../components/poster5.jpeg";
import poster6 from "../components/poster6.jpg";

import logo from "../components/logo2.png";
import logo3 from "../components/logo3.png";

const fallbackRanking = [
  {
    pfm_doc_id: "PF274266",
    pfm_nm: "물랑루즈",
    pfm_start: "2025.11.27",
    pfm_end: "2026.02.22",
    pfm_poster: poster7,
  },

  {
    pfm_doc_id: "PF276569",
    pfm_nm: "킹키부츠",
    pfm_start: "2025.12.17",
    pfm_end: "2026.03.29",
    pfm_poster: poster8,
  },

  {
    pfm_doc_id: "PF274238",
    pfm_nm: "렌트",
    pfm_start: "2025.11.09",
    pfm_end: "2026.02.22",
    pfm_poster: poster6,
  },
];

const fallbackRecommend = [
  {
    pfm_doc_id: "PF275043",
    catchphrase: "우린 왜 그냥 스쳐 가지 않고 \n서로를 바라봤을까",
    pfm_poster: poster4,
  },

  {
    pfm_doc_id: "PF273019",
    catchphrase: "누군가 이 세상을 \n바로잡아야 한다",
    pfm_poster: poster5,
  },

  {
    pfm_doc_id: "PF274238",
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

    postImage: [poster3, poster4],
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
  const [loadingRanking, setLoadingRanking] = useState(true);
  const [loadingRecommend, setLoadingRecommend] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    // 랭킹 데이터 요청
    fetch(`/api/performances/ranking`)
      .then((res) =>
        res.ok ? res.json() : Promise.reject("Ranking API failed")
      )
      .then((data) =>
        setRankingData(Array.isArray(data) ? data : fallbackRanking)
      )
      .catch(() => setRankingData(fallbackRanking))
      .finally(() => setLoadingRanking(false));

    // 추천 공연 요청
    setRecommendData(fallbackRecommend);
    setLoadingRecommend(false);

    // 최근 커뮤니티 글 요청
    fetch("/api/community/latest")
      .then((res) =>
        res.ok ? res.json() : Promise.reject("Community API failed")
      )
      .then((data) =>
        setLatestPosts(Array.isArray(data) ? data : fallbackCommunity)
      )
      .catch(() => setLatestPosts(fallbackCommunity))
      .finally(() => setLoadingPosts(false));
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
              <Link
                to={`/performance/${item.pfm_doc_id}`}
                key={String(item.pfm_doc_id)}
                className="post-item-link"
              >
                <div className="ranking-item">
                  <div className="rank-num">{index + 1}</div>
                  <div className="ranking-info">
                    <div className="title">{item.pfm_nm}</div>
                    <div className="date">
                      {item.pfm_start} ~ {item.pfm_end}
                    </div>
                  </div>
                  <img src={item.pfm_poster} alt={`${item.pfm_nm} 포스터`} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="right-top">
          <h3 id="righttop-title">오픈런 추천 공연</h3>

          <div className="recommend-list">
            {recommendData.map((item, index) => (
              <Link
                to={`/performance/${item.pfm_doc_id}`}
                key={item.pfm_doc_id}
                className="performance-item-link"
              >
                <div className="recommend-card">
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
              </Link>
            ))}
          </div>
        </div>

        <div className="right-bottom">
          <h3 id="rightbottom-title">최근 커뮤니티 글</h3>
          <div className="main2-community-list">
            {loadingPosts ? (
              <p className="calendar-no-records-message">
                관극 기록을 불러오는 중입니다...
              </p>
            ) : (latestPosts.map((item) => (
              <Link
                to={`/community/${item.postDocumentId}`}
                key={String(item.postDocumentId)}
                className="post-item-link"
              >
                <div className="main2-community-item">
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
              </Link>
            ))
          )}
          </div>
        </div>

        <div className="banner">
          <h3 id="title">
            홍익대학교 컴퓨터공학과 25학년도 2학기 졸업프로젝트 연극 뮤지컬 종합 플랫폼 OPENRUN
          </h3>
        </div>
      </div>
    </div>
  );
};

export default Main2;
