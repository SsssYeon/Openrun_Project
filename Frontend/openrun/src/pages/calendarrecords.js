// 관극 기록 달력 화면 -> api 연결 O, 백엔드와 연결 안됐을 시 예시 데이터 노출

import Nav from "../components/nav.js";
import "../css/calendarrecords.css";
import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useNavigate } from "react-router-dom";
import eventsData from "../mocks/events.js"; // 예시 JSON 데이터

const Calendarrecords = () => {
  const [events, setEvents] = useState([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [renderedEvents, setRenderedEvents] = useState([]);
  const navigate = useNavigate();

  // 관극 기록 API 호출
  useEffect(() => {
    const fetchCalendarData = async () => {
      setIsLoading(true);
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      let fetchedEvents = [];

      try {
        const res = await fetch("/api/calendar/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // 토큰 포함
          },
        });
        if (!res.ok) throw new Error("API 응답 오류");
        const data = await res.json();
        fetchedEvents = formatCalendarData(data);
      } catch (error) {
        console.warn("API 호출 실패, 예시 데이터 사용 중:", error);

        fetchedEvents = formatCalendarData(eventsData);
      } finally {
        setEvents(fetchedEvents);
        setSelectedDateEvents(fetchedEvents);
        setRenderedEvents(fetchedEvents);
        setIsLoading(false);
      }
    };
    fetchCalendarData();
  }, []);

  // 공통 데이터 포맷 함수
  const formatCalendarData = (data) =>
    data.map((item) => ({
      id: item.pfmcalender_doc_no,
      title: item.pfmcalender_nm,
      start: item.pfmcalender_date,
      location: item.pfmcalender_location,
      cast: item.pfmcalender_today_cast,
      seat: item.pfmcalender_seat,
      cost: item.pfmcalender_cost,
      memo: item.pfmcalender_memo,
      poster: item.pfmcalender_poster,
      time: item.pfmcalender_time,
      extendedProps: { ...item },
    }));

  // 날짜 클릭 시 해당 날짜의 이벤트만 추출
  const handleDateClick = (arg) => {
    const filteredByDate = events.filter(
      (event) => event.start === arg.dateStr
    );
    setSelectedDateEvents(filteredByDate);

    // 날짜 클릭 시 검색어는 초기화하지 않고, 검색어가 없으면 날짜 필터링 결과를, 있으면 검색 결과에 날짜를 반영합니다.
    if (searchTerm.trim() === "") {
      setRenderedEvents(filteredByDate);
    } else {
      // 검색어가 있는 상태에서 날짜를 클릭하면, 그 날짜에 해당하는 항목들만 검색 필터링을 다시 적용
      const filteredBySearch = filteredByDate.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.cast.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setRenderedEvents(filteredBySearch);
    }
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

  useEffect(() => {
    if (isLoading) return;

    if (searchTerm.trim() === "") {
      setIsSearching(false);
      setRenderedEvents(selectedDateEvents);
      return;
    }

    setIsSearching(true);

    const timer = setTimeout(() => {
      const search = searchTerm.toLowerCase();
      const results = selectedDateEvents.filter((event) => {
        return (
          event.title.toLowerCase().includes(search) ||
          event.location.toLowerCase().includes(search) ||
          event.cast.toLowerCase().includes(search)
        );
      });

      setRenderedEvents(results);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedDateEvents, isLoading]);

  const filteredEvents = selectedDateEvents.filter((event) => {
    const search = searchTerm.toLowerCase();
    return (
      event.title.toLowerCase().includes(search) ||
      event.location.toLowerCase().includes(search) ||
      event.cast.toLowerCase().includes(search)
    );
  });

  return (
    <div>
      <div>
        <Nav />
      </div>
      <div className="calendar-page-container">
        <div className="flex">
          {/* 좌측 달력 */}
          <div className="calendar">
            <FullCalendar
              plugins={[dayGridPlugin]}
              initialView="dayGridMonth"
              events={events}
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
                right: "next",
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
                {isLoading ? (
                  <p className="calendar-no-records-message">
                     관극 기록을 불러오는 중입니다... 
                  </p>
                ) : isSearching ? ( 
                  <p className="calendar-no-records-message">검색 중...</p>
                ) : searchTerm.trim() !== "" && renderedEvents.length === 0 ? (
                  <p className="calendar-no-records-message">
                    검색 결과가 없습니다.
                  </p>
                ) : searchTerm.trim() === "" && events.length === 0 ? (
                  <p className="calendar-no-records-message">
                    오른쪽 아래 '+'버튼을 눌러 관극 기록을 추가해보세요!
                  </p>
                ) : (
                  (searchTerm ? filteredEvents : selectedDateEvents).map(
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
                            <h3 className="ticketsinfomations">
                              {event.title}
                            </h3>
                            <p>날짜: {event.start}</p>
                            <p>시간: {event.time}</p>
                            <p>장소: {event.location}</p>
                            <p>좌석: {event.seat}</p>
                            <p>
                              출연진:{" "}
                              {event.cast.length > 25
                                ? event.cast.slice(0, 24) + "..."
                                : event.cast}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          </div>
        </div>
        <button
          className="floating-add-button"
          onClick={() => navigate("/addrecord")}
        >
          <span className="plus-symbol">+</span>
        </button>
      </div>
    </div>
  );
};

export default Calendarrecords;
