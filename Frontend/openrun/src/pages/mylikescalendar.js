import Nav from "../components/nav.js";
import "../css/mylikescalendar.css";
import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useNavigate } from "react-router-dom";
import favorites from "../mocks/favorites.js"; // 예시 JSON 데이터

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
      title: item.title,
      start: item.start,
      end: addOneDay(item.end), // ✅ 꼭 하루 추가!
       poster: item.poster,     
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

  const filteredEvents = selectedDateEvents.filter((event) => {
    const search = searchTerm.toLowerCase();
    return event.title.toLowerCase().includes(search);
  });

  return (
    <div>
      <div>
        <Nav />
      </div>
      <div className="flex">
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
        <div className="tickets">
          <div className="searchmytickets">
            <input
              type="text"
              placeholder="배우, 공연명, 공연장을 검색하세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="mytickets-scroll">
            <div className="mytickets">
              {(searchTerm ? filteredEvents : selectedDateEvents).map(
                (event) => (
                  <div
                    key={event.id}
                    className="ticket"
                    onClick={() => navigate(`/detail/${event.id}`)}
                  >
                    <div className="ticketscontent">
                      <img
                        src={event.poster}
                        alt={event.title}
                        className="ticketspicture"
                      />
                      <div>
                        <h3 className="ticketsinfomations">{event.title}</h3>
                        <p>날짜: {event.start}</p>
                        <p>시간: {event.time}</p>
                        <p>장소: {event.location}</p>
                        <p>좌석: {event.seat}</p>
                        <p>출연진: {event.cast}</p>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mylikescalendar;
