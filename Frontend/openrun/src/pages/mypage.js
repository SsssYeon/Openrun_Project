// 마이페이지, api 연동 완료(커뮤니티까지 완료)

import React, { useEffect, useState } from "react";
import Nav from "../components/nav";
import { Link, NavLink, useNavigate } from "react-router-dom";
import userData from "../mocks/users";
import favoritesMock from "../mocks/favorites"; // 예시 관심 공연 데이터 임포트
import "../css/mypage.css";
import poster1 from "../components/poster1.jpg";
import poster2 from "../components/poster2.jpg";
import logo from "../components/logo2.png";

const fallbackCommunity = [
  {
    postDocumentId: "post_001",

    userId: "user_20240901",

    userNickname: "오픈런_마스터",

    postTitle: "뮤지컬 '헤드윅' 2층 중앙 시야 후기 및 꿀팁 공유",

    postContent:
      "헤드윅 2024년 시즌 2층 A열 중앙 시야 후기입니다. 생각보다 무대가 잘 보였고, 전반적인 연출을 한눈에 담을 수 있었습니다. 오츠카(망원경) 없이도 충분히 볼만했어요. 다만 배우 표정 디테일은 조금 아쉬웠습니다. 커튼콜 때 사진 찍기 좋은 앵글도 공유합니다!",

    postContentSummary:
      "헤드윅 2024년 시즌 2층 A열 중앙 시야 후기입니다. 생각보다 무대가 잘 보...",

    postTag: ["공연 후기", "공연 정보"],

    postTimeStamp: "2025-05-01T10:00:00Z",

    commentCount: 15,

    postImage: [poster1, poster2],
  },

  {
    postDocumentId: "post_002",

    userId: "user_19991231",

    userNickname: "덕질러_제인",

    postTitle: "연극 '리어왕'을 보고 느낀점: 시대와 인간 본질에 대한 탐구",

    postContent:
      "리어왕을 처음 접했는데, 셰익스피어의 고전이 주는 무게감이 엄청나네요. 특히 주연 배우의 광기 어린 연기가 압권이었습니다. 조명과 무대 장치도 극의 분위기를 잘 살려주었고, 4시간이 짧게 느껴질 정도로 몰입했습니다. 다음 관람 때는 원작을 읽고 가야겠어요.",

    postContentSummary:
      "리어왕을 처음 접했는데, 셰익스피어의 고전이 주는 무게감이 엄청나네요. 특...",

    postTag: ["공연 후기"],

    postTimeStamp: "2025-05-01T15:30:00Z",

    commentCount: 7,

    postImage: [],
  },
  {
    postDocumentId: "post_003",

    userId: "user_87654321",

    userNickname: "정보통_김씨",

    postTitle: "[긴급] 뮤지컬 '오페라의 유령' 2차 티켓팅 정보 및 예매 팁",

    postContent:
      "오페라의 유령 2차 티켓팅이 다음 주 화요일(05/08) 오후 2시에 열립니다. 인터파크 단독이고, 서버 상태가 불안정할 수 있으니 미리 로그인과 결제 수단을 준비해두세요! 특히 1층 VIP석은 오픈 즉시 매진되니, 광클 준비 필수입니다. 저는 이번에 2층 R석을 노리고 있습니다.",

    postContentSummary:
      "오페라의 유령 2차 티켓팅이 다음 주 화요일(05/08) 오후 2시에 열립니다...",

    postTag: ["공연 정보"],

    postTimeStamp: "2025-05-02T09:45:00Z",

    commentCount: 25,
  },
];

const dateTimeOptions = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
};

const MyPage = () => {
  const [user, setUser] = useState(null);
  const [interests, setInterests] = useState([]); // 관심 공연 상태 추가
  const [myPosts, setMyPosts] = useState(fallbackCommunity);
  const navigate = useNavigate();

 useEffect(() => {
    const fetchUser = async () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) return navigate("/login", { replace: true });

      // 1. 닉네임 (사용자 정보) API 호출
      try {
        const userResponse = await fetch(`/api/users/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!userResponse.ok) {
          throw new Error("인증 실패 또는 서버 오류");
        }

        const data = await userResponse.json();
        setUser(data);
      } catch (error) {
        console.error("사용자 정보 로드 실패. Mock 데이터 사용:", error);
        // 닉네임 로드 실패 시에만 Mock 데이터 사용
        setUser(userData); 
        // 🚨 사용자 정보 없이는 다음 API를 호출할 필요가 없다고 가정하고 리턴할 수도 있지만,
        // Mock 데이터라도 로드되었으니 진행하는 것으로 유지했습니다.
      }

      // 2. 관심 공연 API 호출
      try {
        const interestResponse = await fetch(`/api/calendar/like`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!interestResponse.ok) {
          throw new Error("관심 공연 호출 실패");
        }

        const interestData = await interestResponse.json();
        const likeList = interestData.userLikeList || [];
        setInterests(likeList.slice(0, 3)); // 상위 3개만 표시
      } catch (error) {
        console.warn("관심 공연 API 실패. Mock 데이터 사용:", error);
        // 관심 공연 로드 실패 시에만 Mock 데이터 사용
        setInterests(favoritesMock?.slice(0, 3) || []);
      }
      
      // 3. 나의 글 (커뮤니티) API 호출
      try {
        const postsResponse = await fetch(`/api/users/me/posts`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!postsResponse.ok) {
          throw new Error("나의 글 API 실패");
        }

        const postsData = await postsResponse.json();
        // API에서 받은 데이터가 배열이 아니거나 비어있으면 빈 배열 사용 후 2개로 자름
        setMyPosts(postsData.posts?.slice(0, 2) || []);
      } catch (error) {
        console.warn("My posts API failed. Using mock data:", error);
        // 나의 글 로드 실패 시에만 Mock 데이터 사용
        setMyPosts(fallbackCommunity.slice(0, 2));
      }
    };

    fetchUser();
  }, [navigate]); // 의존성 배열 유지

  if (!user) return <div>로딩 중...</div>;

  const handleLogout = async () => {
    const confirmed = window.confirm("로그아웃 하시겠습니까?");
    if (!confirmed) return;

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) throw new Error("로그인 상태가 아닙니다.");

      const response = await fetch(`/api/auth/logout`, {
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

      setUser(null);

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
      fetch(`/api/users/me`, {
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
                  {interests.slice(0, 5).map((show) => (
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

                <div className="user-community" >
                  {myPosts.length === 0 ? (
                    <p>작성한 글이 없습니다.</p>
                  ) : (
                    myPosts.map((item) => (
                      <Link
                        to={`/community/${item.postDocumentId}`}
                        key={item.postDocumentId}
                        className="link-style"
                      >
                        <div className="mypage-user-community-item" key={item.postDocumentId}>
                          <div className="content">
                            <div className="title">
                              {item.postTitle.length > 30
                                ? item.postTitle.slice(0, 29) + "..."
                                : item.postTitle}
                            </div>

                            <div className="subtext">
                              {item.postContent.length > 30
                                ? item.postContent.slice(0, 29) + "..."
                                : item.postContent}
                            </div>
                          </div>

                          <div className="date">
                            {new Date(item.postTimeStamp).toLocaleString(
                              "ko-KR",
                              dateTimeOptions
                            )}
                          </div>
                          <img
                            src={
                              Array.isArray(item.postImage) &&
                              item.postImage.length > 0
                                ? item.postImage[0]
                                : logo
                            }
                            alt={item.postTitle}
                            className="thumb"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = logo;
                            }}
                          />
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
