// 마이페이지 - 비밀번호 변경 => api 연결 완료

import React, { useState } from "react";
import Nav from "../components/nav";
import { Link, useNavigate } from "react-router-dom";
// import userData from "../mocks/users";
import "../css/mypage.css";

const Passwordchange = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. 빈칸 여부 확인
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    // 2. 새 비밀번호 유효성 검사 (영문, 숫자, 특수문자 포함 8자 이상)
    const pwRegex =
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!pwRegex.test(newPassword)) {
      alert(
        "새 비밀번호는 영문, 숫자, 특수기호를 포함한 8자 이상이어야 합니다."
      );
      return;
    }

    // 3. 새 비밀번호와 확인 일치 여부
    if (newPassword !== confirmPassword) {
      alert("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
      return;
    }

    // 4. PATCH 요청 (토큰 필요)
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/users/me/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: currentPassword,
          newPassword: newPassword,
        }),
      });

      if (response.ok) {
        alert("비밀번호가 성공적으로 변경되었습니다.");
        navigate("/account");
      } else if (response.status === 401) {
        alert("현재 비밀번호가 일치하지 않습니다.");
      } else {
        const error = await response.json();
        alert(
          "오류가 발생했습니다: " + (error.message || "다시 시도해주세요.")
        );
      }
    } catch (error) {
      alert("서버 요청 중 오류가 발생했습니다.");
      console.error(error);
    }
  };
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
          <div className="passwordchange-content">
            {/* 현재 비밀번호 */}
            <div>
              <h5> 현재 비밀번호 </h5>
              <input
                type="password"
                class="input-field"
                maxLength="15"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            {/* 새 비밀번호 */}
            <div>
              <h5> 새 비밀번호 </h5>
              <input
                type="password"
                class="input-field"
                maxLength="15"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            {/* 새 비밀번호 확인 */}
            <div>
              <h5> 새 비밀번호 확인 </h5>
              <input
                type="password"
                class="input-field"
                maxLength="15"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div>
              <button type="submit" id="accountbutton" onClick={handleSubmit}>
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
