// api 연동 O, 연동 안되었을 시 mocks 데이터로 + 삭제 구현 완료

import { useParams, useNavigate } from "react-router-dom";
import Nav from "../components/nav";
import eventsData from "../mocks/events"; // 경로는 실제 파일 위치에 맞게 조정
import "../css/eventdetail.css";
import React, { useState, useEffect } from "react";

function Eventdetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token"); // 토큰 가져오기

  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        const res = await fetch(`/api/calendar/me/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // 토큰 포함
          },
        });
        if (!res.ok) throw new Error("API 응답 오류");
        const data = await res.json();
        setEvent(data);
      } catch (error) {
        console.warn("❌ API 실패, 예시 데이터에서 대체 중:", error);
        // ✅ 예시 데이터에서 id로 찾아서 설정
        const fallbackEvent = eventsData.find(
          (item) => String(item.pfmcalender_doc_no) === id
        );

        if (fallbackEvent) {
          setEvent(fallbackEvent);
        } else {
          console.error("해당 id를 가진 예시 데이터를 찾을 수 없습니다.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetail();
  }, [id]);

  if (loading) return <div>불러오는 중...</div>;
  if (!event) return <div>해당 관극 기록을 찾을 수 없습니다.</div>;

  const handleEdit = () => {
    // 예: 수정 페이지로 이동
    navigate(`/modifyrecord/${id}`);
  };

  const handleDelete = async () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        const res = await fetch(`/api/calendar/me/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ 토큰 포함
          },
        });

        if (!res.ok) {
          throw new Error("삭제 요청 실패");
        }

        alert("관극 기록이 삭제되었습니다.");
        navigate("/calendarrecords"); // 목록 페이지 등으로 이동
      } catch (error) {
        console.error("삭제 중 오류 발생:", error);
        alert("삭제에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  return (
    <div>
      <div>
        <Nav />
      </div>
      <div className="event-detail">
        <div className="event-buttons">
          <button className="edit-button" onClick={handleEdit}>
            수정
          </button>
          <button className="delete-button" onClick={handleDelete}>
            삭제
          </button>
        </div>
        <img
          src={event.pfmcalender_poster || "/default-poster.png"}
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
              <strong>시간:</strong> {event.pfmcalender_time}
            </p>
            <p>
              <strong>장소:</strong> {event.pfmcalender_location}
            </p>
            <p>
              <strong>좌석:</strong> {event.pfmcalender_seat}
            </p>
            <p>
              <strong>출연진:</strong> {event.pfmcalender_today_cast || " "}
            </p>
            <p>
              <strong>가격:</strong>{" "}
              {event.pfmcalender_cost?.toLocaleString() || " "}
            </p>
            <p>
              <strong>예매처:</strong> {event.pfmcalender_bookingsite || " "}
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