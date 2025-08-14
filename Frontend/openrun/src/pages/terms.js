// 이용 약관

import React, { useState, useEffect } from "react";
import Nav from "../components/nav";
import { Link, useNavigate } from "react-router-dom";
import mockUserData from "../mocks/users";
import "../css/mypage.css";

const Terms = () => {
  const [userData, setUserData] = useState(null);
  const [user_nm, setName] = useState("");
  const [user_nicknm, setNickname] = useState("");
  const navigate = useNavigate();

  const getToken = () =>
    localStorage.getItem("token") || sessionStorage.getItem("token");

  useEffect(() => {
    // 사용자 정보 가져오기
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("/api/users/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          console.error("유저 정보를 가져오는데 실패했습니다.");
          setUserData(mockUserData);
        }
      } catch (error) {
        console.error("에러 발생:", error);
        setUserData(mockUserData);
      }
    };

    fetchUserInfo();
  }, []);

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          user_nm: user_nm || undefined,
          user_nicknm: user_nicknm || undefined,
        }),
      });

      if (response.ok) {
        alert("수정이 완료되었습니다.");
        window.location.reload();
      } else {
        alert("수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("에러 발생:", error);
    }
  };

  if (!userData) return <div>로딩 중...</div>;

  const handleLogout = async () => {
    const confirmed = window.confirm("로그아웃 하시겠습니까?");
    if (!confirmed) return;

    try {
      const token = getToken();
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
      fetch("/api/users/me", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
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
          서비스 이용 약관 페이지입니다!
        </div>
      </div>
    </div>
  );
};

export default Terms;