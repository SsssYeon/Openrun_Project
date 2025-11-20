// 아이디 찾기 결과창, api 연결 O

import React from "react";
import "../css/findidresult.css";
import { NavLink, useLocation } from "react-router-dom";
import logo from "../components/logo.png";

const Findidresult = () => {

  const location = useLocation();
  const { userId } = location.state || {}; 

  return (
    <div className="findidresult-container">
      <form className="findidresultform">
        <NavLink to="/">
          <img src={logo} alt="로고" className="findidresult_logo" />
        </NavLink>
        <div className="findid_result">
          {userId ? (
            <p>
              귀하의 아이디는{" "}
              <span style={{ color: "#9F0000" }}>{userId}</span>입니다.
            </p>
          ) : (
            <p style={{ color: "gray" }}>잘못된 접근입니다.</p>
          )}
        </div>
        <NavLink to="/login" id="sbtn">
          {" "}
          로그인하러 가기{" "}
        </NavLink>
      </form>
    </div>
  );
};

export default Findidresult;
