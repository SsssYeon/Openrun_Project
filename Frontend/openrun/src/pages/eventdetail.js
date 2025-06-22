import { useParams } from "react-router-dom";
import Nav from "../components/nav";
// import events from "../mocks/events"; // 경로는 실제 파일 위치에 맞게 조정
import "../css/eventdetail.css";
import React, { useState, useEffect } from "react";

function Eventdetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        const res = await fetch(`/api/calendar/me/${id}`);
        const data = await res.json();
        setEvent(data);
      } catch (error) {
        console.error("관극 기록을 불러오는 데 실패했습니다:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetail();
  }, [id]);

  if (loading) return <div>불러오는 중...</div>;
  if (!event) return <div>해당 관극 기록을 찾을 수 없습니다.</div>;

  return (
    <div>
      <div>
        <Nav />
      </div>
      <div className="event-detail">
        <img
          src={"/default-poster.png"} // 포스터 정보가 없다면 기본 이미지 사용
          alt={`${event.pfmcalender_nm} 포스터`}
          className="poster"
        />
        <div className="event-info-container">
          <div className="event-content">
            <h3 className="title-center">{event.pfmcalender_nm}</h3>
            <p>
              <strong>날짜:</strong> {event.pfmcalender_date}
            </p>
            <p>
              <strong>시간:</strong> {event.pfmclender_time}
            </p>
            <p>
              <strong>장소:</strong> {event.pfmclender_location}
            </p>
            <p>
              <strong>좌석:</strong> {event.pfmcalender_seat}
            </p>
            <p>
              <strong>출연진:</strong> {event.pfmcalender_today_cast || " "}
            </p>
            <p>
              <strong>가격:</strong> {event.pfmcalender_cost?.toLocaleString() || " "}
            </p>
          </div>
          <div className="event-review">
            <h3 className="title-center">관람 후기</h3>
            {event.pfmcalender_memo?.trim() ? (
              <p className="review-item">{event.pfmcalender_memo}</p>
            ) : (
              <p>아직 후기가 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Eventdetail;