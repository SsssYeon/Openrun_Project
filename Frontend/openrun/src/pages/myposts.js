// 마이페이지 - 나의 글 => api 연결 완료

import React, { useEffect, useState } from "react";
import Nav from "../components/nav";
import { Link, useNavigate } from "react-router-dom";
import "../css/mypage.css";
import poster1 from "../components/poster1.jpg";
import logo from "../components/logo2.png";
import { communitydata } from "../mocks/communitymocks";

const API_BASE_URL = process.env.REACT_APP_API_BASE;

const Myposts = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [myPosts, setMyPosts] = useState(communitydata);
  const [loading, setLoading] = useState(true);

  const dateTimeOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };

  useEffect(() => {
    const fetchMyPosts = async () => {
      setLoading(true);
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return navigate("/login", { replace: true });
      }

      try {
        const postsResponse = await fetch(`/api/users/me/posts`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!postsResponse.ok) {
          throw new Error("API_FAIL");
        }

        const postsData = await postsResponse.json();
        setMyPosts(postsData.posts || []);
      } catch (error) {
        console.warn(
          `[API FAIL] My posts API failed. Falling back to Mock data.`,
          error.message
        );
        setMyPosts(communitydata);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPosts();
  }, [navigate]);

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
      navigate("/"); // 홈으로 이동
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
          <div>
            <h3 id="account_title">나의 글</h3>
          </div>

          <div class="community-list">
            {loading ? (
              <p className="no-posts-message">
                나의 글 목록을 불러오는 중입니다...
              </p>
            ) : myPosts.length === 0 ? (
              <p className="no-posts-message">작성한 글이 없습니다.</p>
            ) : (
              myPosts.map((post) => (
                <Link
                  to={`/community/${post.postDocumentId}`} // 상세 페이지로 이동 링크
                  key={post.postDocumentId}
                  className="post-item-link"
                >
                  <div className="post-item">
                    <div className="post-content-wrap">
                      <div className="post-item-header">
                        <h4 className="post-title">
                          {post.postTitle.length > 22
                            ? post.postTitle.slice(0, 21) + "..."
                            : post.postTitle}
                        </h4>
                        {post.postTag &&
                          post.postTag.map((tag, index) => (
                            <span key={index} className="post-tag">
                              {tag}
                            </span>
                          ))}
                      </div>
                      <p className="post-summary">
                        {post.postContent.length > 35
                          ? post.postContent.slice(0, 34) + "..."
                          : post.postContent}
                      </p>
                      <div className="post-meta">
                        <span className="post-nickname">
                          {post.userNickname}
                        </span>
                        <span className="post-date">
                          {new Date(post.postTimeStamp).toLocaleString(
                            "ko-KR",
                            dateTimeOptions
                          )}
                        </span>
                        <span className="post-comments">
                          💬 {post.commentCount}
                        </span>
                      </div>
                    </div>
                    <div className="post-image-preview">
                      <img
                        src={
                          Array.isArray(post.postImage) &&
                          post.postImage.length > 0
                            ? post.postImage[0]
                            : logo
                        } 
                        alt={post.postTitle}
                        className="post-thumbnail"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = logo;
                        }}
                      />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Myposts;
