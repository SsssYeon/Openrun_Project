import React from "react";
import Nav from "../components/nav";
import { Link } from "react-router-dom";
import userData from "../mocks/users";
import "../css/mypage.css";

const Account = () => {
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
            <h3 id="account_title">계정 설정</h3>
          </div>
          {/* 아이디 */}
          <div>
            <h5> 아이디 </h5>
            <span className="user-id">{user.ID}</span>
          </div>

          {/* 이름 */}
          <div>
            <h5> 이름 </h5>
            <input
              type="text"
              class="input-field"
              maxLength="10"
              name="userjoin_name"
              // placeholder="이름"
            />
          </div>

          {/* 닉네임 */}
          <div>
            <h5> 닉네임 </h5>
            <input
              type="text"
              class="input-field"
              maxLength="10"
              name="userjoin_nickname"
              // placeholder="닉네임"
            />
          </div>

          {/* 휴대폰 번호 */}
          <div>
            <h5> 휴대폰 번호 </h5>
            <input
              type="text"
              class="input-field"
              maxLength="11"
              name="userjoin_tel"
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
  );
};

export default Account;
