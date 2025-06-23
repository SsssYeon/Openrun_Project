// api 연결 X 버전 => api 연결 버전 다시 만들어야 함

import Nav from "../components/nav.js";
import "../css/mylikescalendar.css";
import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useNavigate } from "react-router-dom";
import favorites from "../mocks/favorites.js"; // 예시 JSON 데이터
import performances from "../mocks/performances.js";

const Mylikescalendar = () => {
  const [events, setEvents] = useState([]); // 전체 관극 기록
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const addOneDay = (dateStr) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
  };

  // 관극 기록 API 호출
  useEffect(() => {
    const formatted = favorites.map((item) => ({
      id: item.id, // ❗️eventClick 등에서 id가 필요함
      title: item.title,
      start: item.start,
      end: addOneDay(item.end),
      poster: item.poster,
      className: item.className, // ✅ className 포함
    }));
    setEvents(formatted);
    setSelectedDateEvents(formatted);
  }, []);

  // 날짜 클릭 시 해당 날짜의 이벤트만 추출
  const handleDateClick = (arg) => {
    const filtered = events.filter((event) => event.start === arg.dateStr);
    setSelectedDateEvents(filtered);
  };

  // 이벤트(포스터) 클릭 시 상세 페이지로 이동
  const handleEventClick = (info) => {
    navigate(`/detail/${info.event.id}`);
  };

  const renderEventContent = (eventInfo) => {
    return (
      <div
        style={{
          backgroundColor: "#ffcc66", // 원하는 색
          borderRadius: "5px",
          padding: "2px 4px",
          fontWeight: "bold",
          color: "#333",
          fontSize: "0.8rem",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {eventInfo.event.title}
      </div>
    );
  };

  const filteredPerformances = performances.filter(
    ({ api_prfcast, api_prfnm, api_fcltynm }) => {
      const term = searchTerm.toLowerCase();
      return (
        api_prfnm.toLowerCase().includes(term) ||
        api_prfcast.toLowerCase().includes(term) ||
        api_fcltynm.toLowerCase().includes(term)
      );
    }
  );

  return (
    <div>
      <div>
        <Nav />
      </div>
      <div className="mylikescalendarbox">
        {/* 좌측 달력 */}
        <div className="mylikescalendar">
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            events={events}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            height={700}
            dayMaxEventRows={false}
            fixedWeekCount={true} // 주 수 고정 해제
            showNonCurrentDates={false}
            contentHeight="auto"
            handleWindowResize={false}
            eventDisplay="auto"
            headerToolbar={{
              left: "prev",
              center: "title",
              right: "next", // 'today' 제거됨
            }}
          />
        </div>

        {/* 우측 상세 정보 요약 카드 */}
        <div className="mylikes-right">
          <div className="searchperformances">
            <input
              type="text"
              placeholder="배우, 공연명, 공연장을 검색하세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="search-results">
            {searchTerm && filteredPerformances.length === 0 && (
              <p>검색 결과가 없습니다.</p>
            )}

            {filteredPerformances.map((performance) => (
              <div key={performance.api_mt20id} className="result-item">
                {performance.api_prfnm}
              </div>
            ))}
          </div>

          <div className="favorites-list">
            <div className="favorites-header">
              <h2>나의 관심 공연</h2>
              <button
                className="favorites-button"
                onClick={() => navigate("/favorites")}
                type="button"
              >
                모두 보기
              </button>
            </div>
            <div className="favorite-items-container">
              {favorites.slice(0, 3).map((fav) => (
                <div key={fav.id} className="favorite-item">
                  <img src={fav.poster} alt={fav.title} />
                  <p>{fav.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mylikescalendar;
