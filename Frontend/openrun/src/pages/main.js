import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/main.css"; // CSS 파일 연결
import logo from "../components/logo.png";
import Nav from "../components/nav.js";

const dummyData = [
  "레미제라블",
  "오페라의 유령",
  "노트르담 드 파리",
  "위키드",
  "캣츠",
  "드라큘라",
];

const Main = () => {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const filtered = dummyData.filter((item) =>
    item.toLowerCase().includes(query.toLowerCase())
  );

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
              {filtered.length > 0 ? (
                filtered.map((item, idx) => (
                  <li
                    key={idx}
                    className="main-dropdown-item"
                    onClick={() => {
                      setQuery(item);
                      setShowDropdown(false);
                    }}
                  >
                    {item}
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
