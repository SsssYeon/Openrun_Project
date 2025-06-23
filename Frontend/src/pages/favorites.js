// 마이페이지 - 관심공연 => api 연결 X

import React from "react";
import Nav from "../components/nav";
import { Link } from "react-router-dom";
// import userData from "../mocks/users";
import "../css/mypage.css";
import poster1 from "../components/poster1.jpg";
import poster2 from "../components/poster2.jpg";

const favoriteShows = [
  { title: "지킬 앤 하이드", image: poster1 },
  { title: "랭보", image: poster2 },
];

const Favorites = () => {
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
            <h3 id="account_title">관심 공연</h3>
          </div>
          <div className="show-grid">
            {favoriteShows.map((show, index) => (
              <div key={index} className="show-card">
                <img src={show.image} alt={show.title} />
                <p>{show.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Favorites;
