import Nav from "../components/nav.js";
import "../css/calendarrecords.css";
import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useNavigate } from "react-router-dom";
import eventsData from "../mocks/events.js"; // 예시 JSON 데이터

const Calendarrecords = () => {
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
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
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            height={700}
            contentHeight="auto"
            contentWidth="auto"
            dayMaxEventRows={false}
            fixedWeekCount={false} // 주 수 고정 해제
            showNonCurrentDates={false}
            handleWindowResize={true}
            headerToolbar={{
              left: 'prev',
              center: 'title',
              right: 'next' // 'today' 제거됨
            }}
          />
        </div>

        {/* 우측 상세 정보 요약 카드 */}
        <div className="tickets">
          {selectedDateEvents.map((event) => (
            <div
              key={event.id}
              className="border rounded-lg p-4 cursor-pointer hover:shadow-md"
              onClick={() => navigate(`/detail/${event.id}`)}
            >
              <div className="flex">
                <img
                  src={event.poster}
                  alt={event.title}
                  className="w-24 h-32 object-cover mr-4"
                />
                <div>
                  <h3 className="font-bold text-lg">{event.title}</h3>
                  <p>날짜: {event.date}</p>
                  <p>시간: {event.time}</p>
                  <p>장소: {event.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendarrecords;
