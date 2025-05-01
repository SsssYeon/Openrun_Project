import React, { useEffect, useState } from "react";
import "../css/main2.css"; // CSS 파일 연결
import poster1 from "../components/poster1.jpg";
import poster2 from "../components/poster2.jpg";
import poster3 from "../components/poster3.jpg";
// import rankData from "../mocks/rank.json";

const Main2 = () => {
  // const [showList, setShowList] = useState([]);

  // useEffect(() => {
  //   // mockData.json 데이터를 상태에 설정
  //   setShowList(rankData);
  // }, []);

  return (
    <div className="layout">
      <div className="left">
        <h3 id="title">오픈런 랭킹</h3>
        {/* <ul>
        {showList.map((show) => (
            <li key={show.id}>
              <img src={show.posterUrl} alt={show.title} />
              <p>{show.rank}위</p>
              <h4>{show.title}</h4>
            </li>
          ))}
        </ul> */}
        <div class="ranking section">
          <div class="ranking-item">
            <div class="rank-num">1</div>
            <div class="ranking-info">
              <div class="title">지킬앤하이드</div>
              <div class="date">2024.11.29 ~ 2025.05.18</div>
            </div>
            <img src={poster1} alt="지킬앤하이드 포스터" />
          </div>

          <div class="ranking-item">
            <div class="rank-num">2</div>
            <div class="ranking-info">
              <div class="title">랭보</div>
              <div class="date">2025.02.19 ~ 2025.05.18</div>
            </div>
            <img src={poster2} alt="랭보 포스터" />
          </div>

          <div class="ranking-item">
            <div class="rank-num">3</div>
            <div class="ranking-info">
              <div class="title">메디슨 카운티의 다리</div>
              <div class="date">2025.05.01 ~ 2025.07.13</div>
            </div>
            <img src={poster3} alt="메디슨 포스터" />
          </div>
        </div>
      </div>

      <div className="right-top">
        <h3 id="title">오픈런 추천 공연</h3>

        <div class="recommend-list">
          <div class="recommend-card">
            <img src={poster1} alt="지킬 포스터" />
            <div class="card-text">
              <div class="catchphrase">
                지금 이 순간, <br></br>끝나지 않는 신화
              </div>
            </div>
          </div>

          <div class="recommend-card">
            <img src={poster2} alt="랭보 포스터" />
            <div class="card-text">
              <div class="catchphrase">그리하여 나는 벗어난다 
                <br></br>세상 모든 것으로부터</div>
            </div>
          </div>

          <div class="recommend-card">
            <img src={poster3} alt="매디슨 포스터" />
            <div class="card-text">
              <div class="catchphrase">기나긴 시간을 건너,<br></br> 단 한 번의 순간</div>
            </div>
          </div>
        </div>
      </div>

      <div className="right-bottom">
        <h3 id="title">최근 커뮤니티 글</h3>
      </div>

      <div className="banner">
        <h3 id="title">배너가 들어갈 공간입니다!</h3>
      </div>
    </div>
  );
};

export default Main2;
