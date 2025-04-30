import React from "react";
import "../css/login.css";
import { NavLink } from "react-router-dom";
import Nav from "../components/nav.js";

const Login = () => {
  return (
    <div>
      <div>
        <Nav />
      </div>
      <form className="loginForm">
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
              autoFocus
            ></input>
            <h5> 비밀번호 </h5>
            <input
              type="password"
              className="password"
              id="password"
              placeholder="비밀번호"
            ></input>
            <button id="loginBut">로그인</button>
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
  );
};

export default Login;
