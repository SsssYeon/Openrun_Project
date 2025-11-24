// 관심공연 달력, api 연결 완료

import Nav from "../components/nav.js";
import "../css/mylikescalendar.css";
import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useNavigate } from "react-router-dom";
import favoritesMock from "../mocks/favorites.js";
import performances from "../mocks/performances.js";

const Mylikescalendar = () => {
  const [events, setEvents] = useState([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPerformances, setFilteredPerformances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const navigate = useNavigate();

  const addOneDay = (dateStr) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
  };

  useEffect(() => {
    const fetchFavorites = async () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      setIsLoading(true);

      try {
        const res = await fetch("/api/user/me/main-favorite", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error("API 요청 실패");

        const data = await res.json();
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
        setSelectedDateEvents(calendarEvents);
        setFavorites(topFavorites);

        setFavorites(likeList.slice(0, 3));
      } catch (error) {
        console.error("관심 공연 API 실패:", error);
        const fallbackEvents = favoritesMock.map((item) => ({
          ...item,
          end: addOneDay(item.end),
        }));

        setEvents(fallbackEvents);
        setSelectedDateEvents(fallbackEvents);
        setFavorites(favoritesMock.slice(0, 3));
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleDateClick = (arg) => {
    const filtered = events.filter((event) => event.start === arg.dateStr);
    setSelectedDateEvents(filtered);
  };

  const handleEventClick = (info) => {
    navigate(`/performance/${info.event.extendedProps.pfm_doc_id}`);
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchTerm.trim()) {
        setFilteredPerformances([]);
        setLoadingSearch(false);
        return;
      }

      setLoadingSearch(true);

      try {
        const res = await fetch(
          `/api/performances/search?query=${encodeURIComponent(searchTerm)}`
        );
        if (!res.ok) throw new Error("API 요청 실패");

        const data = await res.json();
        setFilteredPerformances(data);
      } catch (error) {
        console.error("API 실패, mocks로 대체:", error);

        const fallbackTop = favoritesMock.slice(0, 3);
        const fallbackEvents = fallbackTop.map((item, index) => ({
          ...item,
          end: addOneDay(item.end),
          className: `favorite-${(index % 3) + 1}`,
        }));
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
        setEvents(fallbackEvents);
        setSelectedDateEvents(fallbackEvents);
        setFavorites(fallbackTop);
      } finally {
        setLoadingSearch(false);
      }
    };

    const timer = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(timer);
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
            fixedWeekCount={true}
            showNonCurrentDates={false}
            contentHeight="auto"
            handleWindowResize={false}
            eventDisplay="auto"
            headerToolbar={{
              left: "prev",
              center: "title",
              right: "next",
            }}
          />
        </div>

        {/* 우측 검색창 및 관심 공연 */}
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
              {loadingSearch ? (
                <p className="loading-message">검색 중...</p>
              ) : searchTerm === "" ? (
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
                    <span className="result-title">
                      {performance.pfm_nm.length > 18
                        ? performance.pfm_nm.slice(0, 17) + "..."
                        : performance.pfm_nm}
                    </span>
                    <span className="result-duration">
                      {performance.pfm_start} ~ {performance.pfm_end}
                    </span>
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
                type="all-favorite-button"
              >
                모두 보기
              </button>
            </div>
            <div className="favorite-items-container">
              {isLoading ? (
                <p className="no-favorites-message">
                  관심 공연을 불러오는 중...
                </p>
              ) : favorites.length === 0 ? (
                <p className="no-favorites-message">
                  모두 보기를 누른 후 달력에 표시될 공연을 선택해주세요!
                </p>
              ) : (
                favorites.map((fav, index) => (
                  <div
                    key={fav.id}
                    className={`favorite-item favorite-${index + 1}`}
                    onClick={() => navigate(`/performance/${fav.pfm_doc_id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <img src={fav.poster} alt={fav.title} />
                    <p>
                      {fav.title.length > 9
                        ? fav.title.slice(0, 9) + "..."
                        : fav.title}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mylikescalendar;
