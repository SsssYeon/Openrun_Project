import { useParams } from "react-router-dom";
import Nav from "../components/nav";
import events from "../mocks/events"; // 경로는 실제 파일 위치에 맞게 조정
import "../css/eventdetail.css";
import React, { useState, useEffect } from "react";

function Eventdetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const foundEvent = events.find((e) => e.id === id);
    setEvent(foundEvent);
  }, [id]);

  if (!event) return <div>해당 공연을 찾을 수 없습니다.</div>;

  return (
    <div>
      <div>
        <Nav />
      </div>
      <div className="event-detail">
        <img
          src={event.poster}
          alt={`${event.title} 포스터`}
          className="poster"
        />
        <div className="event-info-container">
          <div className="event-content">
            <h3 className="title-center">{event.title}</h3>
            <p>
              <strong>날짜:</strong> {event.start}
            </p>
            <p>
              <strong>시간:</strong> {event.time}
            </p>
            <p>
              <strong>장소:</strong> {event.location}
            </p>
            <p>
              <strong>좌석:</strong> {event.seat}
            </p>
            <p>
              <strong>출연진:</strong> {event.cast || " "}
            </p>
            <p>
              <strong>가격:</strong> {event.price}
            </p>
          </div>
          <div className="event-review">
            <h3 className="title-center">관람 후기</h3>
            {event.review && event.review.trim() !== "" ? (
              <p className="review-item">{event.review}</p>
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
