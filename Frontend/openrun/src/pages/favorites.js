// 마이페이지 - 관심공연 => api 연결 X

import React, { useState } from "react";
import Nav from "../components/nav";
import { Link, useNavigate } from "react-router-dom";
import "../css/mypage.css";
import favorites from "../mocks/favorites";

const Favorites = () => {

  const navigate = useNavigate();

  const [likedStates, setLikedStates] = useState(() => {
    const initialState = {};
    favorites.forEach((fav) => {
      initialState[fav.id] = false; // 백엔드에서 정보 받아와 기존에 저장되어 있는 정보대로 달력에 표시되고 있던 공연들만 채운 하트 표시 예정
    });
    return initialState;
  });

  const toggleHeart = (id) => {
    setLikedStates((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

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
            {favorites.map((show) => (
              <div key={show.id} className="show-card">
                <div className="favorite-poster-wrapper">
                  <img
                    src={show.poster}
                    alt={show.title}
                    onClick={() => navigate(`/performance/${show.pfm_doc_id}`)}
                    style={{ cursor: "pointer" }}
                  />
                  <span
                    className="heart-icon"
                    onClick={() => toggleHeart(show.id)}
                  >
                    {likedStates[show.id] ? "❤️" : "🤍"}
                  </span>
                </div>
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
