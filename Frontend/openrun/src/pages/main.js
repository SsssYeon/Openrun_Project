// api를 통해 못 찾을 시 mocks 데이터에서 찾도록 설정

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/main.css"; // CSS 파일 연결
import logo from "../components/logo.png";
import Nav from "../components/nav.js";
import performancesData from "../mocks/performances"; 

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
        setResults(data); // 백엔드에서 공연 배열을 반환해야 함
      } catch (error) {
      console.warn("🔁 API 실패 → mocks 데이터로 대체 중:", error);

      const filtered = performancesData.filter(
        (item) =>
          item.pfm_nm &&
          item.pfm_nm.toLowerCase().includes(query.toLowerCase())
      );

      setResults(filtered); // ✅ 예시 데이터 필터링
    }
    };

    const timer = setTimeout(fetchResults, 300);
  return () => clearTimeout(timer);
}, [query]);

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <div>
      <div>
        <Nav />
      </div>
      <div className="search-container">
        <img src={logo} alt="Logo" className="logo" onClick={handleLogoClick} />
        <div className="search-box">
          <input
            type="text"
            placeholder="궁금한 공연을 입력하세요"
            className="search-input"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
          />
          <button className="search-icon"> ▼</button>

          {showDropdown && query && (
            <ul className="main-dropdown">
              {results.length > 0 ? (
                results.map((item) => (
                  <li
                    key={item.pfm_doc_id} // 백엔드 필드명 기준
                    className="main-dropdown-item"
                    onClick={() => {
                      navigate(`/performance/${item.pfm_doc_id}`);
                      setQuery("");
                      setShowDropdown(false);
                    }}
                  >
                    {item.pfm_nm}
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