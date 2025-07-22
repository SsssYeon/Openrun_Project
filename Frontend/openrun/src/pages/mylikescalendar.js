// 검색 기능만 연결 완료 api 연결 X 버전 => api 연결 버전 다시 만들어야 함

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
  const [filteredPerformances, setFilteredPerformances] = useState([]);
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
      pfm_doc_id: item.pfm_doc_id,
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
    navigate(`/performance/${info.event.extendedProps.pfm_doc_id}`);
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchTerm.trim()) {
        setFilteredPerformances([]);
        return;
      }

      try {
        const res = await fetch(
          `/api/performances/search?query=${encodeURIComponent(searchTerm)}`
        );
        if (!res.ok) throw new Error("API 요청 실패");

        const data = await res.json();
        setFilteredPerformances(data);
      } catch (error) {
        console.error("API 실패, mocks로 대체:", error);

        // mocks로 대체
        const fallback = performances.filter(
          ({ pfm_cast, pfm_nm, pfm_fclty_nm }) => {
            const term = searchTerm.toLowerCase();
            return (
              pfm_nm?.toLowerCase().includes(term) ||
              pfm_cast?.toLowerCase().includes(term) ||
              pfm_fclty_nm?.toLowerCase().includes(term)
            );
          }
        );
        setFilteredPerformances(fallback);
      }
    };

    fetchSearchResults();
  }, [searchTerm]);

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

        {/* 우측 검색창 및 관심 공연 */}
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
            {searchTerm === "" ? (
              <p>궁금한 공연의 제목을 입력해주세요</p>
            ) : filteredPerformances.length === 0 ? (
              <p>검색 결과가 없습니다.</p>
            ) : (
              filteredPerformances.map((performance) => (
                <div
                  key={performance.pfm_doc_id}
                  className="result-item"
                  onClick={() =>
                    navigate(`/performance/${performance.pfm_doc_id}`)
                  }
                >
                  {performance.pfm_nm}
                </div>
              ))
            )}
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
              {favorites.slice(0, 3).map((fav, index) => (
                <div
                  key={fav.id}
                  className={`favorite-item favorite-${index + 1}`}
                  onClick={() => navigate(`/performance/${fav.pfm_doc_id}`)} // ✅ 이동 추가
                  style={{ cursor: "pointer" }}
                >
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
