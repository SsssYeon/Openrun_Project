// 마이페이지 - 계정 설정 => api 연결 완료

import React, { useState, useEffect } from "react";
import Nav from "../components/nav";
import { Link, useNavigate } from "react-router-dom";
import mockUserData from "../mocks/users";
import "../css/mypage.css";

const PRIVACY_POLICY = `
🛡️ 오픈런(OpenRun) 개인정보 처리 방침

오픈런은 이용자의 개인정보를 소중하게 생각하며, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 및 「개인정보 보호법」 등 관련 법규를 준수하고 있습니다.

1. 개인정보의 수집 및 이용 목적

오픈런은 수집한 개인정보를 다음의 목적을 위해 활용합니다.

1-1. 회원 관리 및 식별
목적: 회원제 서비스 이용에 따른 본인 확인, 개인 식별, 불량 이용 방지, 가입 및 탈퇴 의사 확인
수집 항목: 이름, 전화번호, 아이디, 비밀번호 (암호화)

1-2. 서비스 제공 및 콘텐츠 관리
목적: 커뮤니티 활동 및 콘텐츠 제공(나의 글, 관심 공연 목록), 관극 기록 캘린더 등 맞춤 서비스 제공
수집 항목: 닉네임, 관극 기록 정보(공연명, 날짜, 좌석 등), 관심 공연 목록

2. 수집하는 개인정보 항목 및 수집 방법

회원 가입 시: 이용자가 직접 이름, 아이디, 비밀번호, 전화번호, 닉네임을 입력하는 방식으로 수집합니다.
서비스 이용 시: 웹/앱 서비스 이용 과정에서 서비스 이용 기록, 접속 로그, 쿠키, 접속 IP 정보, 기기 정보 등이 자동적으로 생성 및 수집될 수 있습니다.

3. 개인정보의 보유 및 이용 기간

이용자의 개인정보는 원칙적으로 수집 및 이용 목적이 달성되거나, 이용자가 회원 탈퇴를 요청하는 경우 **지체 없이 파기**됩니다. 다만, 관계 법령에 의해 보존할 필요가 있는 경우 해당 법령이 정한 기간 동안 보관합니다.

계약 또는 청약철회 등에 관한 기록 (전자상거래법): 5년
소비자의 불만 또는 분쟁 처리에 관한 기록 (전자상거래법): 3년
로그인 기록 및 접속 기록 (통신비밀보호법): 3개월

4. 개인정보의 파기 절차 및 방법

파기 절차: 목적 달성 후 별도의 DB로 옮겨져 법령에 따라 일정 기간 저장 후 파기됩니다.
파기 방법: 전자적 파일은 기록을 재생할 수 없는 기술적 방법을 사용하며, 종이 문서는 분쇄하거나 소각하여 파기합니다.

5. 개인정보의 제3자 제공 및 공유

오픈런은 이용자의 동의 없이는 원칙적으로 외부에 제공하지 않습니다. (법령에 의한 경우 등 예외)

6. 이용자의 권리 및 의무

이용자는 개인정보에 대해 열람, 정정, 삭제, 처리 정지 등을 요구할 수 있으며, 오픈런은 이에 지체 없이 조치합니다.

7. 개인정보 처리 방침 변경

이 방침은 시행일로부터 적용되며, 변경 사항이 있을 경우 시행 7일 전부터 서비스 내 공지사항을 통하여 고지할 것입니다.

시행일자: 2025년 11월 20일
`;
// --------------------------------------------------------

const Privacy = () => {
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

  if (!userData)
    return (
      <div>
        <Nav />
        <div
          className="community-container"
          style={{ textAlign: "center", marginTop: "100px" }}
        >
          로딩 중...
        </div>
      </div>
    );

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
      navigate("/"); // 홈으로 이동
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
            localStorage.clear();
            sessionStorage.clear();
            alert("회원 탈퇴가 완료되었습니다.");
            navigate("/"); // 홈으로 이동
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
          <div
            className="terms-content-box"
            style={{
              maxHeight: "600px",
              overflowY: "auto",
              whiteSpace: "pre-wrap",
              lineHeight: "1.6",
            }}
          >
            {PRIVACY_POLICY}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
