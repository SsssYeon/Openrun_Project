import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/main.css"; // CSS 파일 연결
import logo from "../components/logo.png";
import ReactFullpage from "@fullpage/react-fullpage";


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

  const renderMain2 = () => (
    <div className="layout">
      <div className="left">
        <h3 id="title">오픈런 랭킹</h3>
      </div>
      <div className="right-top">
        <h3 id="title">오픈런 추천 공연</h3>
      </div>
      <div className="right-bottom">
        <h3 id="title">최근 커뮤니티 글</h3>
      </div>
      <div className="banner">
        <h3 id="title">배너가 들어갈 공간입니다!</h3>
      </div>
    </div>
  );

  return (
    <ReactFullpage
      scrollingSpeed={500} // 스크롤 속도 조정
      navigation={true} // 네비게이션 버튼 활성화
      fitToSection={true}
      anchors={["sectionOne", "sectionTwo"]}
      scrollOverflow={false}
      loopTop={false}
      loopBottom={false}
      sectionsColor={["#fff", "#f0f0f0"]} // 각 섹션 배경색 설정
      
      render={() => (
        <ReactFullpage.Wrapper> 

          {/* 첫 번째 섹션 */}
          <div className="section" id="sectionOne">
            <div className="search-container">
              <img
                src={logo}
                alt="Logo"
                className="logo"
                onClick={handleLogoClick}
              />
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
                  <ul className="dropdown">
                    {filtered.length > 0 ? (
                      filtered.map((item, idx) => (
                        <li
                          key={idx}
                          className="dropdown-item"
                          onClick={() => {
                            setQuery(item);
                            setShowDropdown(false);
                          }}
                        >
                          {item}
                        </li>
                      ))
                    ) : (
                      <li className="dropdown-item no-result">
                        검색 결과 없음
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* 두 번째 섹션: Main2 컴포넌트 */}
          <div className="section" id="sectionTwo" data-scrolloverflow="false">
          {renderMain2()}
          </div>
          </ReactFullpage.Wrapper>
      )}
    />
  );
};

export default Main;
