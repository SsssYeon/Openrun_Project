import Nav from "../components/nav.js";
import "../css/calendarrecords.css";
import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useNavigate } from "react-router-dom";
import eventsData from "../mocks/events.js"; // 예시 JSON 데이터

const Calendarrecords = () => {
  const [selectedDateEvents, setSelectedDateEvents] = useState(eventsData);
  const navigate = useNavigate();

  // 날짜 클릭 시 해당 날짜의 이벤트만 추출
  const handleDateClick = (arg) => {
    const filteredEvents = eventsData.filter(
      (event) => event.date === arg.dateStr
    );
    setSelectedDateEvents(filteredEvents);
  };

  // 이벤트(포스터) 클릭 시 상세 페이지로 이동
  const handleEventClick = (info) => {
    navigate(`/detail/${info.event.id}`);
  };

  const renderEventContent = (eventInfo) => {
    const { poster } = eventInfo.event.extendedProps;
    return <img src={poster} alt="poster" />;
  };

  const handleEventDidMount = (info) => {
    const dayCell = info.el.closest(".fc-daygrid-day");
    const dateNumberEl = dayCell?.querySelector(".fc-daygrid-day-number");
    if (dateNumberEl) {
      dateNumberEl.style.display = "none";
    }
  };

  return (
    <div>
      <div>
        <Nav />
      </div>
      <div className="flex">
        {/* 좌측 달력 */}
        <div className="calendar">
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            events={eventsData}
            eventContent={renderEventContent}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            height={700}
            contentHeight="auto"
            contentWidth="auto"
            dayMaxEventRows={false}
            fixedWeekCount={true} // 주 수 고정 해제
            showNonCurrentDates={false}
            handleWindowResize={false}
            eventDidMount={handleEventDidMount}
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
            />
          </div>

          <div className="mytickets-scroll">
            <div className="mytickets">
              {selectedDateEvents.map((event) => (
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
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendarrecords;
