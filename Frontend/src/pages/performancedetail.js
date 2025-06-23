import { useParams } from "react-router-dom";
import Nav from "../components/nav";
// import performances from "../mocks/performances"; // 경로는 실제 파일 위치에 맞게 조정
import "../css/performancedetail.css";
import React, { useState, useEffect } from "react";

const Performancedetail = () => {
  const { id } = useParams();
  const [performance, setPerformance] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const response = await fetch(`/api/performances/${id}`);
        if (!response.ok) {
          throw new Error("공연 정보를 불러올 수 없습니다.");
        }
        const data = await response.json();

        // 백엔드 필드를 프론트에 맞게 변환 (선택)
        const mappedData = {
          api_mt20id: data.pfm_doc_id,
          api_prfnm: data.pfm_nm,
          api_prfpdfrom: data.pfm_start,
          api_prfpdto: data.pfm_end,
          api_fcltynm: data.pfm_fclty_nm,
          api_prfcast: data.pfm_cast,
          api_prfruntime: data.pfm_runtime,
          api_prfage: data.pfm_age,
          api_entrpsnmP: data.pfm_mnfctr,
          api_pcseguidance: data.pfm_cost,
          api_poster: data.pfm_poster,
          api_sty: data.pfm_sty,
          api_genrenm: data.pfm_genre,
          api_dtguidance: data.pfm_dt,
          api_relatenm: data.pfm_bookingsite_nm,
          api_relateurl: data.pfm_bookingsite_url,
        };

        setPerformance(mappedData);
      } catch (error) {
        console.error("Error fetching performance:", error);
      }
    };

    const fetchFavoriteStatus = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;
      try {
        const response = await fetch(
          `/api/performances/${id}/interest?user_id=${userId}`
        );
        const data = await response.json();
        setIsFavorite(data.isLiked); // 또는 true/false 반환 구조에 따라 수정
      } catch (error) {
        console.error("관심공연 상태 확인 실패:", error);
      }
    };

    fetchPerformance();
    fetchFavoriteStatus();
  }, [id]);

  if (!performance) return <div>해당 공연을 찾을 수 없습니다.</div>;

  const toggleFavorite = async () => {
    const userId = localStorage.getItem("user_id");

    if (!userId) {
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
        },
        body: newFavoriteStatus
          ? JSON.stringify({
              user_id: userId, // 실제 사용자 ID로 교체
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
      setIsFavorite(!newFavoriteStatus); // 실패 시 롤백
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