// 공연 상세정보 - 관심공연 추가 

import { useParams } from "react-router-dom";
import Nav from "../components/nav";
import performances from "../mocks/performances"; 
import "../css/performancedetail.css";
import React, { useState, useEffect } from "react";

const Performancedetail = () => {
  const { id } = useParams();
  const [performance, setPerformance] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const response = await fetch(`/api/performances/${id}`);
        if (!response.ok) {
          throw new Error("공연 정보를 불러올 수 없습니다.");
        }
        const data = await response.json();

        const mappedData = {
          api_mt20id: data.mt20id,
          api_prfnm: data.prfnm,
          api_prfpdfrom: data.prfpdfrom,
          api_prfpdto: data.prfpdto,
          api_fcltynm: data.fcltynm,
          api_prfcast: data.prfcast,
          api_prfruntime: data.prfruntime,
          api_prfage: data.prfage,
          api_entrpsnmP: data.entrpsnmP,
          api_pcseguidance: data.pcseguidance,
          api_poster: data.poster,
          api_sty: data.sty,
          api_genrenm: data.genrenm,
          api_dtguidance: data.dtguidance,
          api_relatenm: data.relatenm,
          api_relateurl: data.relateurl,
        };

        setPerformance(mappedData);
      } catch (error) {
        console.error("Error fetching performance:", error);
      }finally {
        setLoading(false);
      }
    };

      const found = performances.find((p) => p.pfm_doc_id === id);
      if (found) {
        setPerformance({
          api_mt20id: found.pfm_doc_id,
          api_prfnm: found.pfm_nm,
          api_prfpdfrom: found.pfm_start,
          api_prfpdto: found.pfm_end,
          api_fcltynm: found.pfm_fclty_nm,
          api_prfcast: found.pfm_cast,
          api_prfruntime: found.pfm_runtime,
          api_prfage: found.pfm_age,
          api_entrpsnmP: found.pfm_mnfctr,
          api_pcseguidance: found.pfm_cost,
          api_poster: found.pfm_poster,
          api_sty: found.pfm_sty,
          api_genrenm: found.pfm_genre,
          api_dtguidance: found.pfm_dt,
        });
      } else {
        setPerformance(null);
      }

    const fetchFavoriteStatus = async () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;
      try {
        const response = await fetch(
          `/api/performances/${id}/interest`,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

       if (!response.ok) throw new Error("관심 여부 조회 실패");

        const data = await response.json();
        setIsFavorite(data.isLiked); 
      } catch (error) {
        console.error("관심공연 상태 확인 실패:", error);
      }
    };

    fetchPerformance();
    fetchFavoriteStatus();
  }, [id]);

  if (loading) {
    return (
      <div>
        <Nav />
        <div
          className="community-container"
          style={{ textAlign: "center", marginTop: "100px" }}
        >
          공연을 불러오는 중...
        </div>
      </div>
    );
  }

  if (!performance)
    return (
      <div>
        <Nav />
        <div
          className="community-container"
          style={{ textAlign: "center", marginTop: "100px" }}
        >
          해당 공연을 찾을 수 없습니다.
        </div>
      </div>
    );;

  const toggleFavorite = async () => {
    const token = localStorage.getItem("token")|| sessionStorage.getItem("token");

    if (!token) {
      alert("로그인 후 이용해주세요.");
      return;
    }

    const newFavoriteStatus = !isFavorite;
    setIsFavorite(newFavoriteStatus);

    const url = `/api/performances/${performance.api_mt20id}/interest`;

    try {
      const response = await fetch(url, {
        method: newFavoriteStatus ? "POST" : "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: newFavoriteStatus
          ? JSON.stringify({
              likecalender_nm: performance.api_prfnm,
              likecalender_timestamp: new Date().toISOString(),
            })
          : null,
      });

      if (!response.ok) {
        throw new Error("관심공연 요청 실패");
      }
    } catch (error) {
      console.error("관심공연 처리 중 오류 발생:", error);
      setIsFavorite(!newFavoriteStatus); 
    }
  };

  return (
    <div>
      <div>
        <Nav />
      </div>
      <div className="performance-detail">
        <div className="poster-wrapper">
          <div className="favorite-toggle">
            <p className="favorite-text">
                {isFavorite ? "관심 공연 해제" : "관심 공연 등록"}
            </p>
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
            <strong>줄거리: </strong> {performance.api_sty}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Performancedetail;