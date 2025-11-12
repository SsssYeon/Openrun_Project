// 마이페이지 - 관심공연 => api 연결 완료
// /api/users/me/interests을 통해 모든 관심공연의 정보를 받아옴
// GET /api/users/me/interests 응답의 userLikeList 각 항목에 is_main_favorite: true/false 필드를 포함 (달력에 노출되는 공연 목록에 있는지 확인)
// (예: is_main_favorite 필드가 없거나 false면 🤍, true면 ❤️)

import React, { useState, useEffect } from "react";
import Nav from "../components/nav";
import { Link, useNavigate } from "react-router-dom";
import "../css/mypage.css";
import mockFavorites from "../mocks/favorites";

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [likedStates, setLikedStates] = useState({});

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login");
      return;
    }

    const fetchFavorites = async () => {
      try {
        const response = await fetch("/api/users/me/interests", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("API 요청 실패");

        const data = await response.json();
        const likeList = data.userLikeList || [];
        const priorityList = data.userPriorityLikeList || [];
        setFavorites(likeList); // 관심 공연이 없으면 빈 배열로 처리됨

        const mainFavoriteIds = new Set(
          priorityList.map((item) => item.pfm_doc_id)
        );

        const initialLikedStates = {};
        likeList.forEach((fav) => {
          initialLikedStates[fav.id] = mainFavoriteIds.has(fav.pfm_doc_id);
        });
        setLikedStates(initialLikedStates);
      } catch (error) {
        console.error("API 오류 발생, mocks 데이터 사용:", error);
        setFavorites(mockFavorites);

        const initialLikedStates = {};
        mockFavorites.forEach((fav) => {
          // mock 데이터의 is_main_favorite 필드 사용
          initialLikedStates[fav.id] = fav.is_main_favorite || false;
        });
        setLikedStates(initialLikedStates);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [token, navigate]);

  const handleLogout = async () => {
    const confirmed = window.confirm("로그아웃 하시겠습니까?");
    if (!confirmed) return;

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) throw new Error("로그인 상태가 아닙니다.");

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "서버에서 로그아웃 처리 실패");
      }

      localStorage.removeItem("token");
      sessionStorage.removeItem("token");

      alert("정상적으로 로그아웃되었습니다.");
      navigate("/"); // 로그인 페이지나 홈으로 이동
    } catch (error) {
      alert(`로그아웃 오류: ${error.message}`);
      console.error("로그아웃 실패:", error);
    }
  };

  const handleWithdraw = () => {
    const confirmed = window.confirm("회원 탈퇴 하시겠습니까?");
    if (confirmed) {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token"); // 여기에 토큰 가져오기 추가
      fetch("/api/users/me", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (res.ok) {
            localStorage.clear(); // 모든 사용자 정보 제거
            sessionStorage.clear();
            alert("회원 탈퇴가 완료되었습니다.");
            navigate("/"); // 홈 또는 탈퇴 완료 페이지로 이동
          } else {
            return res.json().then((data) => {
              throw new Error(data.message || "탈퇴 처리에 실패했습니다.");
            });
          }
        })
        .catch((error) => {
          alert(`에러: ${error.message}`);
        });
    }
  };

  // const [likedStates, setLikedStates] = useState(() => {
  //   const initialState = {};
  //   favorites.forEach((fav) => {
  //     initialState[fav.id] = false; // 백엔드에서 정보 받아와 기존에 저장되어 있는 정보대로 달력에 표시되고 있던 공연들만 채운 하트 표시 예정
  //   });
  //   return initialState;
  // });

  const toggleMainFavoriteAPI = async (showId, isCurrentlyMain, pfm_doc_id) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const method = isCurrentlyMain ? "DELETE" : "POST";
    // DELETE 시에는 URL 파라미터로, POST 시에는 Body로 pfm_doc_id 전달 가정
    const url = isCurrentlyMain
      ? `/api/user/me/main-favorite/${pfm_doc_id}`
      : `/api/user/me/main-favorite`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body:
          method === "POST" ? JSON.stringify({ pfm_doc_id: pfm_doc_id }) : null,
      });

      if (!response.ok) throw new Error("달력 노출 상태 변경 실패");

      // DB 변경 성공 시 UI 상태 업데이트
      setLikedStates((prev) => ({
        ...prev,
        [showId]: !isCurrentlyMain, // 상태 반전
      }));
    } catch (error) {
      console.error("달력 노출 토글 실패:", error);
      alert(`상태 변경 오류: ${error.message}`);
    }
  };

  const toggleHeart = (id, pfm_doc_id) => {
    const isCurrentlyMain = likedStates[id];

    // ⭐️ 1. 현재 채워진 하트 개수 계산
    const currentMainCount = Object.values(likedStates).filter(
      (state) => state === true
    ).length;

    // ⭐️ 2. 4번째 추가 시도 시 차단
    if (!isCurrentlyMain && currentMainCount >= 3) {
      alert("달력 노출 공연은 최대 3개까지만 설정할 수 있습니다.");
      return; // API 호출을 막고 함수 종료
    }

    toggleMainFavoriteAPI(id, isCurrentlyMain, pfm_doc_id);
  };

  return (
    <div>
      <Nav />
      <div className="mypage-container">
        {/* 왼쪽 메뉴 탭 */}
        <div className="mypage-left">
          <div className="menu">
            <h2 className="menu-name">내 정보 설정</h2>
            <ul className="menu-item">
              <li>
                <Link to="/account">계정 설정</Link>
              </li>
              <li>
                <Link to="/myposts">나의 글</Link>
              </li>
              <li>
                <Link to="/favorites">관심 공연</Link>
              </li>
              <li>
                <Link to="/passwordchange">비밀번호 변경</Link>
              </li>
              <li>
                <button onClick={handleLogout} className="text-button">
                  로그아웃
                </button>
              </li>
              <li>
                <button onClick={handleWithdraw} className="text-button">
                  회원 탈퇴
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="menu-name">서비스 약관</h2>
            <ul className="menu-item">
              <li>
                <Link to="/terms">서비스 이용 약관</Link>
              </li>
              <li>
                <Link to="/privacy">개인정보 처리 방침</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="account-right">
          <div>
            <h3 id="account_title">관심 공연</h3>
          </div>
          <div className="show-grid">
            {/* 조건부 렌더링 시작 */}
            {favorites.length === 0 ? (
              // 메시지 디자인 바꾸기!!!!!! css 코드 추가
              <div className="no-favorites-message-container">
                <p className="no-favorites-message-mypage">
                  홈 화면에서 공연을 검색하고 관심공연을 추가해보세요!
                </p>
              </div>
            ) : (
              // ELSE: favorites가 있다면 목록을 렌더링합니다.
              favorites.map((show) => (
                <div key={show.id} className="show-card">
                  <div className="favorite-poster-wrapper">
                    <img
                      src={show.poster}
                      alt={show.title}
                      onClick={() =>
                        navigate(`/performance/${show.pfm_doc_id}`)
                      }
                      style={{ cursor: "pointer" }}
                    />
                    <span
                      className="heart-icon"
                      onClick={() => toggleHeart(show.id, show.pfm_doc_id)}
                    >
                      {likedStates[show.id] ? "❤️" : "🤍"}
                    </span>
                  </div>
                  <p>{show.title}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Favorites;
