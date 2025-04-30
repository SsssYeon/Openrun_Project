import React from "react";
import "../css/findidresult.css";
import { NavLink } from "react-router-dom";
import logo from "../components/logo.png";

const Findidresult = () => {
  return (
    <div>
        <form className="findidresultform">
      <NavLink to="/">
        <img src={logo} alt="로고" className="findidresult_logo" />
      </NavLink>
      <div className="findid_result">
        <p>
          귀하의 아이디는{" "}
          <span style={{ color: "#9F0000" }}>exampleUserId123</span>입니다.{/* 유저 아이디 DB에서 전달받아 출력 */}
        </p>
      </div>
      <NavLink to="/" id="sbtn"> 로그인하러 가기 </NavLink>
      </form>
    </div>
  );
};

export default Findidresult;
