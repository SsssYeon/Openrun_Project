//api 연결 O

import React, { useEffect, useState } from "react";
import "../css/login.css";
import { NavLink, useNavigate } from "react-router-dom";
import Nav from "../components/nav.js";

const Login = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [autoLogin, setAutoLogin] = useState(false); // ✅ 자동 로그인 여부
  const navigate = useNavigate(); // 로그인 성공 후 페이지 이동용

  const handleLogin = async (e) => {
    e.preventDefault(); // 폼 제출 기본 동작 막기

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          user_pw: password,
        }),
      });

      if (!response.ok) {
        throw new Error("로그인 실패");
      }

      const data = await response.json();
      // 예시: 토큰 저장

      const storage = autoLogin ? localStorage : sessionStorage;
      storage.setItem("token", data.user_local_token);
      storage.setItem("userId", data.user_id);
      storage.setItem("nickname", data.user_nicknm);

      alert(`${data.user_nicknm}님 환영합니다!`);
      navigate("/"); // 홈 또는 마이페이지 등으로 이동
    } catch (err) {
      console.error(err);
      alert("아이디 또는 비밀번호를 확인하세요.");
    }
  };

  useEffect(() => {
    if (
      process.env.NODE_ENV === "development" &&
      !localStorage.getItem("token") &&
      !sessionStorage.getItem("token")
    ) {
      localStorage.setItem("token", "dummy-token");
      localStorage.setItem("userId", "testuser");
      localStorage.setItem("nickname", "테스트계정");
    }
  }, []); // 임시 코드 로그인된 상태로 만들기 위해 토큰 자동 삽입, 추후 주석처리 예정 -> 백 개발 시 주석처리하고 진행해주세요!

  return (
    <div>
      <div>
        <Nav />
      </div>
      <div className="login-container">
        <form className="loginForm" onSubmit={handleLogin}>
          <div>
            <div>
              <h2 id="login_title">로그인</h2>
            </div>
          </div>
          <div>
            <div className="input">
              <h5> 아이디 </h5>
              <input
                type="text"
                className="userId"
                id="userId"
                placeholder="아이디"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                autoFocus
              ></input>
              <h5> 비밀번호 </h5>
              <input
                type="password"
                className="password"
                id="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              ></input>

              {/* ✅ 자동 로그인 체크박스 추가 */}
              <div style={{ marginTop: "15px", marginBottom: "5px" }}>
                <label className="auto-login-label">
                  <input
                    type="checkbox"
                    checked={autoLogin}
                    onChange={(e) => setAutoLogin(e.target.checked)}
                  />
                  &nbsp;자동 로그인
                </label>
              </div>

              <button id="loginBut" type="submit">
                로그인
              </button>
              <div className="link">
                <NavLink to="/findid">아이디 찾기</NavLink>
                <span>&nbsp;|&nbsp;</span>
                <NavLink to="/findpw">비밀번호 찾기</NavLink>
                <span>&nbsp;|&nbsp;</span>
                <NavLink to="/userjoin"> 회원가입</NavLink>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
