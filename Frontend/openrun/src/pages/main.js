// 첫번째 홈 화면

import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import "../css/main.css"; 
import logo from "../components/logo.png";
import Nav from "../components/nav.js";
import performancesData from "../mocks/performances"; 
import logo3 from "../components/logo3.png";

const Main = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim() === "") {
        setResults([]);
        return;
      }

      try {
        const response = await fetch(`/api/performances/search?query=${encodeURIComponent(query)}`);
        if (!response.ok) {
          throw new Error("검색 실패");
        }
        const data = await response.json();
        setResults(data); 
      } catch (error) {
      console.warn("🔁 API 실패 → mocks 데이터로 대체 중:", error);

      const filtered = performancesData.filter(
        (item) =>
          item.pfm_nm &&
          item.pfm_nm.toLowerCase().includes(query.toLowerCase())
      );

      setResults(filtered); 
    }
    };

    const timer = setTimeout(fetchResults, 300);
  return () => clearTimeout(timer);
}, [query]);

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <div className="main-page-container">
      <div>
        <nav className="navbar">
              <div className="nav-left">
                <NavLink to="/">
                  <img src={logo3} alt="로고" className="nav-logo" />
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
                <NavLink to="/community" className="nav-item">커뮤니티</NavLink>
                <NavLink to="/mypage" className="nav-item">마이페이지</NavLink> {/* 로그인 시 마이페이지로, 로그인하지 않은 상태일 시 로그인 페이지로 */}
              </div>
            </nav>
      </div>
      <div className="main-search-container">
        <img src={logo} alt="Logo" className="main-logo" onClick={handleLogoClick} />
        <div className="main-search-box">
          <input
            type="text"
            placeholder="궁금한 공연을 입력하세요"
            className="main-search-input"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
          />
          <button className="main-search-icon"> ▼</button>

          {showDropdown && query && (
            <ul className="main-dropdown">
              {results.length > 0 ? (
                results.map((item) => (
                  <li
                    key={item.pfm_doc_id} 
                    className="main-dropdown-item"
                    onClick={() => {
                      navigate(`/performance/${item.pfm_doc_id}`);
                      setQuery("");
                      setShowDropdown(false);
                    }}
                  >
                    <span className="result-title">
                      {item.pfm_nm.length > 14
                        ? item.pfm_nm.slice(0, 13) + "..."
                        : item.pfm_nm}
                    </span>
                    <span className="result-duration">
                        {item.pfm_start} ~ {item.pfm_end}
                    </span>
                  </li>
                ))
              ) : (
                <li className="no-result">검색 결과 없음</li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Main;