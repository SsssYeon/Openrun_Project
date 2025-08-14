// 닉네임 불러오는 것만 api 연결 완료, api 연결 안됐을 때 mocks 데이터 사용 (오픈런 고인물)

import React, { useEffect, useState } from "react";
import Nav from "../components/nav";
import { Link, NavLink, useNavigate } from "react-router-dom";
import userData from "../mocks/users";
import favoritesMock from "../mocks/favorites"; // 예시 관심 공연 데이터 임포트
import "../css/mypage.css";

const MyPage = () => {
  const [user, setUser] = useState(null);
  const [interests, setInterests] = useState([]); // 관심 공연 상태 추가
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        
          if (!token) {
        // 토큰이 없으면 로그인 페이지로 이동
        navigate("/login");
        return; // 함수 종료
      }
          // 1) 유저 기본 정보 가져오기 (닉네임 등)
        const userResponse = await fetch("/api/users/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!userResponse.ok) {
          throw new Error("인증 실패 또는 서버 오류");
        }

        const data = await userResponse.json();
        setUser(userData);

        // 2) 관심 공연 0~2번 인덱스 가져오기
        const interestResponse = await fetch("/api/users/me/interests", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!interestResponse.ok) {
          throw new Error("관심 공연 요청 실패");
        }

        const interestData = await interestResponse.json();
        // 관심 공연이 userLikeList 배열이라면, 0~2까지만 slice
        setInterests(interestData.userLikeList?.slice(0, 3) || []);
      } catch (error) {
        console.error("유저 정보 또는 관심 공연 불러오기 실패:", error);
        setUser(userData); // 예시 데이터로 대체

        // 예시 데이터에도 관심 공연 정보가 있으면 상위 3개만 추출
        setInterests(favoritesMock?.slice(0, 3) || []);
      }
    };

    fetchUser();
  }, [navigate]);

  if (!user) return <div>로딩 중...</div>;

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
        localStorage.getItem("token") || sessionStorage.getItem("token");
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
                <NavLink to="/account">계정 설정</NavLink>
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
        <div className="mypage-right">
          <div className="mypage-scroll">
            {/* 오른쪽 본문 영역 */}
            <div className="mypage-right-top">
              <p className="hello">
                안녕하세요{" "}
                <span className="hello-name">{user.user_nicknm}</span>님!
              </p>

              {/* 관심 공연 */}
              <div className="mypage-right-middle">
                <h3 className="user-title">나의 관심 공연</h3>
                <div className="user-favorite">
                  {interests.length === 0 && <p>관심 공연이 없습니다.</p>}
                  {interests.map((show) => (
                    <div key={show.id} className="user-favorite-content">
                      <img
                        src={show.poster}
                        alt={show.title}
                        className="user-favorite-poster"
                      />
                      <p className="user-favorite-title">
                        {show.title.length > 7
                          ? show.title.slice(0, 7) + "..."
                          : show.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 나의 글 */}
              <div className="mypage-right-bottom">
                <h3 className="user-title">나의 글</h3>
                <h4 id ="mypage-notice"> 추후 구현 예정입니다! </h4>
                {/* <div className="user-community">
                  {user.posts.map((post) => (
                    <div key={post.id} className="user-community-content">
                      <div className="user-community-title">{post.title}</div>
                      <div className="user-community-date">{post.date}</div>
                    </div>
                  ))}
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
