// api 연결 완료 버전 => 인덱스 0~2까지 노출

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../components/nav.js";
import "../css/mylikescalendar.css";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import favoritesMock from "../mocks/favorites.js";
import performances from "../mocks/performances.js";

const Mylikescalendar = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]); // 전체 관심 공연(달력 이벤트)
  const [selectedDate, setSelectedDate] = useState(""); // 선택 날짜(YYYY-MM-DD)
  const [favorites, setFavorites] = useState([]); // 우측 상위 3개
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPerformances, setFilteredPerformances] = useState([]);
  const [error, setError] = useState("");

  const addOneDay = (dateStr) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
  };

  // 관심 공연 로드
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const token =
            localStorage.getItem("token") || sessionStorage.getItem("token");

        const res = await fetch("/api/calendar/like", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) throw new Error("API 요청 실패");

        const data = await res.json(); // { userLikeList: [...] } 형태 가정
        const likeList = data.userLikeList || [];
        const topFavorites = likeList.slice(0, 3);

        const calendarEvents = topFavorites.map((item, index) => ({
          id: item.id,
          pfm_doc_id: item.pfm_doc_id,
          title: item.title,
          start: item.start,
          end: addOneDay(item.end),
          poster: item.poster,
          className: `favorite-${(index % 3) + 1}`,
        }));

        setEvents(calendarEvents);
        setFavorites(topFavorites);
      } catch (err) {
        console.error("관심 공연 API 실패, mocks로 대체:", err);
        setError("네트워크 오류로 예시 데이터를 표시합니다.");

        const fallbackTop = favoritesMock.slice(0, 3);
        const fallbackEvents = fallbackTop.map((item, index) => ({
          ...item,
          end: addOneDay(item.end),
          className: `favorite-${(index % 3) + 1}`,
        }));

        setEvents(fallbackEvents);
        setFavorites(fallbackTop);
      }
    };

    fetchFavorites();
  }, [navigate]);

  // 선택한 날짜의 이벤트 목록(실제로 렌더링에 사용해서 no-unused-vars 제거)
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return events.filter((ev) => ev.start === selectedDate);
  }, [events, selectedDate]);

  // 날짜 클릭 시 해당 날짜만 필터
  const handleDateClick = (arg) => {
    setSelectedDate(arg.dateStr);
  };

  // 이벤트(포스터) 클릭 시 상세 페이지로 이동
  const handleEventClick = (info) => {
    const pfmDocId =
        info.event.extendedProps?.pfm_doc_id || info.event.id || "";
    if (pfmDocId) navigate(`/performance/${pfmDocId}`);
  };

  // 검색
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
      } catch (err) {
        console.error("검색 API 실패, mocks로 대체:", err);

        const term = searchTerm.toLowerCase();
        const fallback = performances.filter(
            ({ pfm_cast, pfm_nm, pfm_fclty_nm }) =>
                pfm_nm?.toLowerCase().includes(term) ||
                pfm_cast?.toLowerCase().includes(term) ||
                pfm_fclty_nm?.toLowerCase().includes(term)
        );
        setFilteredPerformances(fallback);
      }
    };

    fetchSearchResults();
  }, [searchTerm]);

  return (
      <div>
        <Nav />

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
                fixedWeekCount={true}
                showNonCurrentDates={false}
                contentHeight="auto"
                handleWindowResize={false}
                eventDisplay="auto"
                headerToolbar={{ left: "prev", center: "title", right: "next" }}
            />

            {/* 선택한 날짜 이벤트 카드 (경고 제거 & UX 보완) */}
            {selectedDate && (
                <div style={{ marginTop: 16 }}>
                  <h3 style={{ margin: "8px 0" }}>
                    {selectedDate} 관심 공연 ({selectedDateEvents.length}건)
                  </h3>
                  {selectedDateEvents.length === 0 ? (
                      <div>해당 날짜의 관심 공연이 없습니다.</div>
                  ) : (
                      <div
                          style={{
                            display: "grid",
                            gap: 12,
                            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                          }}
                      >
                        {selectedDateEvents.map((ev, idx) => (
                            <div
                                key={ev.id || idx}
                                className={`favorite-item favorite-${(idx % 3) + 1}`}
                                onClick={() =>
                                    navigate(`/performance/${ev.pfm_doc_id || ev.id}`)
                                }
                                style={{
                                  cursor: "pointer",
                                  border: "1px solid #e5e5e5",
                                  borderRadius: 8,
                                  padding: 8,
                                  background: "#fff",
                                }}
                            >
                              {ev.poster ? (
                                  <img
                                      src={ev.poster}
                                      alt={ev.title}
                                      style={{
                                        width: "100%",
                                        height: 220,
                                        objectFit: "cover",
                                        borderRadius: 6,
                                      }}
                                  />
                              ) : (
                                  <div
                                      style={{
                                        width: "100%",
                                        height: 220,
                                        background: "#eee",
                                        borderRadius: 6,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#777",
                                      }}
                                  >
                                    No Poster
                                  </div>
                              )}
                              <p style={{ marginTop: 8, fontWeight: 600 }}>{ev.title}</p>
                            </div>
                        ))}
                      </div>
                  )}
                </div>
            )}

            {error && (
                <div style={{ marginTop: 12, color: "crimson" }}>{error}</div>
            )}
          </div>

          {/* 우측 검색창 및 관심 공연 Top3 */}
          <div className="mylikes-right">
            <div className="search-section">
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
            </div>

            <div className="favorites-list">
              <div className="favorites-header">
                <h2>나의 관심 공연</h2>
                <button
                    className="favorites-button"
                    onClick={() => navigate("/favorites")}
                    type="button" // 올바른 타입 지정
                >
                  모두 보기
                </button>
              </div>

              <div className="favorite-items-container">
                {favorites.map((fav, index) => (
                    <div
                        key={fav.id}
                        className={`favorite-item favorite-${index + 1}`}
                        onClick={() => navigate(`/performance/${fav.pfm_doc_id}`)}
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