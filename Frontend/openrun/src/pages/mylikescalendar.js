// api 연결 완료 버전 => /api/calendar/like을 통해 달력에 노출되도록 한 공연의 정보만 받아옴(최대 3개)
// 검색 결과로 공연 기간까지 띄워줘야 공연 찾는데 편할 것 같아서 기간도 결과창에 추가했습니다
// `/api/performances/search?query=${encodeURIComponent(searchTerm)}` 이 api로 받는 정보에 pfm_start, pfm_end 추가해주세요!

import Nav from "../components/nav.js";
import "../css/mylikescalendar.css";
import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useNavigate } from "react-router-dom";
import favoritesMock from "../mocks/favorites.js"; // 예시 JSON 데이터
import performances from "../mocks/performances.js";

const Mylikescalendar = () => {
  const [events, setEvents] = useState([]); // 전체 관극 기록
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [favorites, setFavorites] = useState([]); // 우측에 표시할 관심 공연
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPerformances, setFilteredPerformances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const addOneDay = (dateStr) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
  };

  // 관극 기록 API 호출
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

        const data = await res.json(); // userLikeList 배열 포함
        const likeList = data.userLikeList || [];
        const topFavorites = likeList.slice(0, 3); // 원하는 개수만큼

        // 전체 달력에 들어갈 공연 (관심 공연 전체)
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

        // 오른쪽 하단에 표시할 상위 3개 관심 공연
        setFavorites(likeList.slice(0, 3));
      } catch (error) {
        console.error("관심 공연 API 실패:", error);
        // ✅ fallback: mocks 사용
        const fallbackEvents = favoritesMock.map((item) => ({
          ...item,
          end: addOneDay(item.end),
        }));

        setEvents(fallbackEvents);
        setSelectedDateEvents(fallbackEvents);
        setFavorites(favoritesMock.slice(0, 3));
      } finally {
        // ⭐️ 로딩 종료 (성공/실패 무관)
        setIsLoading(false);
      }
    };

    fetchFavorites();
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
                // 로딩 완료 후 데이터가 없을 경우
                <p className="no-favorites-message">
                  모두 보기를 누른 후 달력에 표시될 공연을 선택해주세요!
                </p>
              ) : (
                // 데이터가 있을 경우 목록 렌더링
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
