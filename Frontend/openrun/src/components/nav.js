// 메인 화면 이외의 화면에 들어갈 네비게이션
import React from "react";
import { NavLink } from "react-router-dom";
import "./nav.css"; 
import logo from "../components/logo3.png";

const Nav = () => {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <NavLink to="/">
          <img src={logo} alt="로고" className="nav-logo" />
        </NavLink>
      </div>
      <div className="nav-right">
        <div className="nav-item-dropdown">
          <NavLink to="/calendarrecords" className="nav-item">내 달력</NavLink>{/* 로그인 시 내 달력으로, 로그인하지 않은 상태일 시 로그인 페이지로 */}
          <div className="dropdown-content">
            <NavLink to="/calendarrecords" className="dropdown-item">내 관극 기록</NavLink>
            <NavLink to="/mylikescalendar" className="dropdown-item">관심 공연</NavLink>
            <NavLink to="/myreport" className="dropdown-item">나의 통계</NavLink>
          </div>
        </div>
        <NavLink to="/userjoin" className="nav-item">커뮤니티</NavLink>
        <NavLink to="/mypage" className="nav-item">마이페이지</NavLink> {/* 로그인 시 마이페이지로, 로그인하지 않은 상태일 시 로그인 페이지로 */}
      </div>
    </nav>
  );
};

export default Nav;
