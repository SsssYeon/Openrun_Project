import React from "react";
import "../css/main2.css"; // CSS 파일 연결
import poster1 from "../components/poster1.jpg";
import poster2 from "../components/poster2.jpg";
import poster3 from "../components/poster3.jpg";
import logo2 from "../components/logo2.png";

const Main2 = () => {
  return (
    <div className="layout">
      <div className="left">
        <h3 id="title">오픈런 랭킹</h3>
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
                <div class="catchphrase">
                  그리하여 나는 벗어난다
                  <br></br>세상 모든 것으로부터
                </div>
              </div>
            </div>

            <div class="recommend-card">
              <img src={poster3} alt="매디슨 포스터" />
              <div class="card-text">
                <div class="catchphrase">
                  기나긴 시간을 건너,<br></br> 단 한 번의 순간
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="right-bottom">
          <h3 id="title">최근 커뮤니티 글</h3>

          <div class="community-list">
            <div class="community-item">
              <div class="content">
                <div class="title">지킬앤하이드 후기</div>
                <div class="subtext">지킬을 보고 왔습니다...</div>
              </div>
              <div class="date">25.05.01</div>
              <img src={poster1} alt="썸네일" class="thumb" />
            </div>

            <div class="community-item">
              <div class="content">
                <div class="title">링아센 좌석 후기</div>
                <div class="subtext">
                  가성비석 다녀왔습니다! 시야는 좋은데 음향이...
                </div>
              </div>
              <div class="date">25.03.29</div>
              <img src={logo2} alt="썸네일" class="thumb" />
            </div>
          </div>
        </div>
      
      <div className="banner">
        <h3 id="title">배너가 들어갈 공간입니다!</h3>
      </div>
    </div>
  );
};

export default Main2;
