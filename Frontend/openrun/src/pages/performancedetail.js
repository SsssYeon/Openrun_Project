// api 연결 X 버전 / api 연결 버전 구현 완료, 관심공연 저장은 구현 안되어 있음

import { useParams } from "react-router-dom";
import Nav from "../components/nav";
import performances from "../mocks/performances"; // 경로는 실제 파일 위치에 맞게 조정
import "../css/performancedetail.css";
import React, { useState, useEffect } from "react";

const Performancedetail = () => {
  const { id } = useParams();
  const [performance, setPerformance] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const found = performances.find((p) => p.api_mt20id === id);
    setPerformance(found);
  }, [id]);

  if (!performance) return <div>해당 공연을 찾을 수 없습니다.</div>;

  const toggleFavorite = () => {
    setIsFavorite((prev) => !prev);
    // TODO: localStorage 저장 또는 서버로 전송
  };

  return (
    <div>
      <div>
        <Nav />
      </div>
      <div className="performance-detail">
       <div className="poster-wrapper">
        <div className="favorite-toggle">
          <button className="heart-button" onClick={toggleFavorite}>
            {isFavorite ? "❤️" : "🤍"}
          </button>
        </div>
        <img
          src={performance.api_poster}
          alt={`${performance.api_prfnm} 포스터`}
          className="performance_poster"
        />
        
        </div>

        <div className="performance-info-container">
          <h3 className="performance-title-center">{performance.api_prfnm}</h3>
          <p>
            <strong>공연 기간: </strong> {performance.api_prfpdfrom} ~{" "}
            {performance.api_prfpdto}
          </p>
          <p>
            <strong>공연장: </strong> {performance.api_fcltynm}
          </p>
          <p>
            <strong>출연진: </strong> {performance.api_prfcast}
          </p>
          <p>
            <strong>러닝타임: </strong> {performance.api_prfruntime}
          </p>
          <p>
            <strong>관람 연령: </strong> {performance.api_prfage}
          </p>
          <p>
            <strong>제작사: </strong> {performance.api_entrpsnmP}
          </p>
          <p>
            <strong>장르: </strong> {performance.api_genrenm}
          </p>
          <p>
            <strong>공연 시간: </strong> {performance.api_dtguidance}
          </p>
          <p>
            <strong>티켓 가격: </strong> {performance.api_pcseguidance}
          </p>
          <p>
            <strong>예매처: </strong>
            <a
              href={performance.api_relateurl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {performance.api_relatenm}
            </a>
          </p>
          <p>
            <strong>줄거리: </strong> {performance.api_sty}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Performancedetail;
