import React, { useState } from "react";
import Nav from "../components/nav";

// import userData from "../mocks/users";
import "../css/myreport.css";

import reports from "../mocks/reports";

const Myreport = () => {
  const [period, setPeriod] = useState("전체 기간");

  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
  };

  const { totalViewCount, totalWorksCount, frequentWorks, frequentActors } =
    reports;

  return (
    <div>
      <Nav />
      <div className="mystats-container">
        <div className="dropdown-container">
          <select value={period} onChange={handlePeriodChange}>
            <option>전체 기간</option>
            <option>최근 1개월</option>
            <option>최근 3개월</option>
            <option>올해</option>
          </select>
        </div>
        <div className="stats-boxes">
          <div className="stat-box">
            <h3>관람 횟수</h3>
            <h2>{totalViewCount}회</h2>
          </div>
          <div className="stat-box">
            <h3>관람 작품 수</h3>
            <h2>{totalWorksCount}편</h2>
          </div>
        </div>

        <div className="details-container">
          <div className="frequent-section">
            <h3>자주 본 작품</h3>
            <div className="frequent-posters">
              {frequentWorks.slice(0, 3).map((work, index) => (
                <div className="poster-item" key={index}>
                  {work.poster && (
                    <img src={work.poster} alt={`${work.title} 포스터`} />
                  )}
                  <p>
                    {work.title}
                    <br />
                    {work.count}회
                  </p>
                </div>
              ))}
            </div>
            <ul className="text-list">
              {frequentWorks.slice(3).map((work, index) => (
                <li key={index}>
                  <span className="text-left">{work.title}</span>
                  <span className="text-right">{work.count}회</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="frequent-section">
            <h3>자주 본 배우</h3>
            <ul className="text-list">
              {frequentActors.map((actor, index) => (
                <li key={index}>
                  <span className="text-left">{actor.name}</span>
                  <span className="text-right">{actor.count}회</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Myreport;
