// 마이페이지 - 나의 글 => api 연결 필요

import React from "react";
import Nav from "../components/nav";
import { Link } from "react-router-dom";
// import userData from "../mocks/users";
import "../css/mypage.css";
import poster1 from "../components/poster1.jpg";
import logo2 from "../components/logo2.png";

const Myposts = () => {
  // const user = userData;
  return (
    <div>
      <Nav />
      <div className="mypage-container">
        {/* 왼쪽 메뉴 탭 */}
        <div className="mypage-left">
          <div className="menu">
            <h2 className="menu-name">내 정보 설정</h2>
            <ul className="menu-item">
              <li>
                <Link to="/account">계정 설정</Link>
              </li>
              <li>
                <Link to="/myposts">나의 글</Link>
              </li>
              <li>
                <Link to="/favorites">관심 공연</Link>
              </li>
              <li>
                <Link to="/passwordchange">비밀번호 변경</Link>
              </li>
              <li>
                <Link to="/logout">로그아웃</Link>
              </li>
              <li>
                <Link to="/withdraw">회원 탈퇴</Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="menu-name">서비스 약관</h2>
            <ul className="menu-item">
              <li>
                <Link to="/terms">서비스 이용 약관</Link>
              </li>
              <li>
                <Link to="/privacy">개인정보 처리 방침</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="account-right">
          <div>
            <h3 id="account_title">나의 글</h3>
          </div>

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
      </div>
    </div>
  );
};

export default Myposts;
