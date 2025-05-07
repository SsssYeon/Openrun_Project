import React from "react";
import Nav from "../components/nav";
import { Link } from "react-router-dom";
import userData from "../mocks/users";
import "../css/mypage.css";

const MyPage = () => {
  const user = userData;
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
                <Link to="/mypage/account">계정 설정</Link>
              </li>
              <li>
                <Link to="/mypage/posts">나의 글</Link>
              </li>
              <li>
                <Link to="/mypage/interest">관심 공연</Link>
              </li>
              <li>
                <Link to="/mypage/password">비밀번호 변경</Link>
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
        <div className="mypage-right">
          {/* 오른쪽 본문 영역 */}
          <div className="mypage-right-top">
            <p className="hello">
              안녕하세요{" "}
              <span className="hello-name">{user.nickname}</span>님!
            </p>

            {/* 관심 공연 */}
            <div className="mypage-right-middle">
              <h3 className="user-title">나의 관심 공연</h3>
              <div className="user-favorite">
                {user.favorites.map((show) => (
                  <div key={show.id} className="user-favorite-content">
                    <img
                      src={show.thumbnail}
                      alt={show.title}
                      className="user-favorite-poster"
                    />
                    <p className="user-favorite-title">{show.title}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 나의 글 */}
            <div className="mypage-right-bottom">
              <h3 className="user-title">나의 글</h3>
              <div className="user-community">
                {user.posts.map((post) => (
                  <div key={post.id} className="user-community-content">
                    <div className="user-community-title">{post.title}</div>
                    <div className="user-community-date">{post.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
