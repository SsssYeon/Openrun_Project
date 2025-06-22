import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/main.css"; // CSS 파일 연결
import logo from "../components/logo.png";
import Nav from "../components/nav.js";
// import performancesData from "../mocks/performances"; 

// const dummyData = [
//   "레미제라블",
//   "오페라의 유령",
//   "노트르담 드 파리",
//   "위키드",
//   "캣츠",
//   "드라큘라",
//   "지킬 앤 하이드",
// ];

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
        console.error("검색 중 오류 발생:", error);
        setResults([]);
      }
    };

    const debounceTimer = setTimeout(fetchResults, 300); // 디바운싱

    return () => clearTimeout(debounceTimer);
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
                    {item.api_prfnm}
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
