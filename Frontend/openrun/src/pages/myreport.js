// 나의 통계 => api 연결 필요

import React, { useEffect, useState } from "react";
import Nav from "../components/nav";

// import userData from "../mocks/users";
import "../css/myreport.css";

import fallbackReports from "../mocks/reports";

const Myreport = () => {
  const [period, setPeriod] = useState("전체 기간");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
    // TODO: 기간 필터 적용 API가 있다면 여기에 반영
  };

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const res = await fetch("/api/users/me/statistics", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("데이터를 불러오지 못했습니다.");

        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.warn("API 실패, 더미 데이터 사용:", err);
        setStats(fallbackReports); // mocks 사용
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) return <div>통계를 불러오는 중...</div>;
  if (!stats) return <div>데이터 없음</div>;

  const {
    total_view: totalView,
    unique_pfm: uniqueWorks,
    most_view_pfm: mostViewedWorks = [],
    most_view_actor: mostViewedActors = [],
  } = stats;

  return (
    <div>
      <Nav />
      <div className="mystats-container">
        {/* <div className="dropdown-container">
          <select value={period} onChange={handlePeriodChange}>
            <option>전체 기간</option>
            <option>최근 1개월</option>
            <option>최근 3개월</option>
            <option>올해</option>
          </select>
        </div> */}
        <div className="stats-boxes">
          <div className="stat-box">
            <h3>관람 횟수</h3>
            <h2>{totalView}회</h2>
          </div>
          <div className="stat-box">
            <h3>관람 작품 수</h3>
            <h2>{uniqueWorks}편</h2>
          </div>
        </div>

        <div className="details-container">
          <div className="frequent-section">
            <h3>자주 본 작품</h3>
            <div className="frequent-posters">
              {mostViewedWorks.slice(0, 3).map((work, index) => (
                <div className="poster-item" key={index}>
                  {work.pfm_poster && (
                    <img
                      src={work.pfm_poster}
                      alt={`${work.pfm_nm} 포스터`}
                    />
                  )}
                  <p>
                    {work.pfm_nm}
                    <br />
                    {work.pfm_cnt}회
                  </p>
                </div>
              ))}
            </div>
            <ul className="text-list">
              {mostViewedWorks.slice(3).map((work, index) => (
                <li key={index}>
                  <span className="text-left">{work.pfm_nm}</span>
                  <span className="text-right">{work.pfm_cnt}회</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="frequent-section">
            <h3>자주 본 배우</h3>
            <ul className="text-list">
              {mostViewedActors.slice(0, 8).map((actor, index) => (
                <li key={index}>
                  <span className="text-left">{actor.actor_nm}</span>
                  <span className="text-right">{actor.actor_cnt}회</span>
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
