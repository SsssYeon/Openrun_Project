// 마이페이지 - 비밀번호 변경 => api 연결 X

import React from "react";
import Nav from "../components/nav";
import { Link } from "react-router-dom";
// import userData from "../mocks/users";
import "../css/mypage.css";

const Passwordchange = () => {
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
            <h3 id="account_title">비밀번호 변경</h3>
          </div>
          <div className="passwodchange-content">
          {/* 현재 비밀번호 */}
            <div>
              <h5> 현재 비밀번호 </h5>
              <input
                type="password"
                class="input-field"
                maxLength="15"
                name="userjoin_password"
                // placeholder="비밀번호"
              />
            </div>


            {/* 새 비밀번호 */}
            <div>
              <h5> 새 비밀번호 </h5>
              <input
                type="password"
                class="input-field"
                maxLength="15"
                name="userjoin_password"
                // placeholder="비밀번호"
              />
            </div>

            {/* 새 비밀번호 확인 */}
            <div>
              <h5> 새 비밀번호 확인 </h5>
              <input
                type="password"
                class="input-field"
                maxLength="15"
                name="userjoin_pswCheck"
                // placeholder="비밀번호 확인"
              />
            </div>

            <div>
              <button type="submit" id="accountbutton">
                저장
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
 
  );
};

export default Passwordchange;
