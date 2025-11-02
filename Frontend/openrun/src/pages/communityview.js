// 시야 커뮤니티 -> api 연결 완료

import React, { useState, useEffect, useCallback } from "react";
import Nav from "../components/nav";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "../css/community.css";
import { communitydata } from "../mocks/communitymocks";
import logo from "../components/logo2.png";

const API_BASE_URL = process.env.REACT_APP_API_BASE;
const TARGET_TAG = "시야";

const apiService = {
  // ⭐️ GET: 글 목록 조회 (/api/community/posts)
  getPosts: async (token) => {
    const url = `/api/community/posts?tag=${encodeURIComponent(
      TARGET_TAG
    )}`;
    // ⭐️ 실제 API fetch 요청 구조
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // 토큰은 선택 사항
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // HTTP 오류 시 Mock Fallback을 위해 Error throw
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // ⭐️ 서버 응답 형태 가정: 글 목록 배열
    return data.posts || data;
  },
};

const CommunityView = () => {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. API 호출 시도 (tag 파라미터 없이 '전체' 글 요청)
      const responsePosts = await apiService.getPosts(token);

      // 2. 성공 시 API 응답 사용
      setPosts(responsePosts);
      console.log(`[API SUCCESS] All posts loaded successfully.`);
    } catch (error) {
      // 3. API 호출 실패 시 Mock Fallback 로직
      console.error(`[API FAIL] Falling back to Mock data.`, error.message);
      setError(error.message);

      // 4. Mock 데이터 전체 사용 (이 컴포넌트는 '전체'만 담당)
      const mockFiltered = communitydata.filter(
        (post) => post.postTag && post.postTag.includes(TARGET_TAG)
      );
      setPosts(mockFiltered);
    } finally {
      setLoading(false);
    }
  }, [token]); // token이 변경될 때만 fetchPosts 재생성

  useEffect(() => {
    // 컴포넌트 마운트 시 한 번만 전체 글을 불러옴
    fetchPosts();
  }, [fetchPosts]);

  const dateTimeOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };

  return (
    <div>
      <Nav />
      <div className="community-container">
        {/* 커뮤니티 메뉴 탭 */}
        <div className="community-left">
          <div className="menu">
            <ul className="menu-item">
              <li>
                <NavLink to="/community">전체</NavLink>
              </li>
              <li>
                <Link to="/communityview">시야</Link>
              </li>
              <li>
                <Link to="/communityreview">공연 후기</Link>
              </li>
              <li>
                <Link to="/communityinfo">공연 정보</Link>
              </li>
              <li>
                <Link to="/communitychat">사담</Link>
              </li>
              <li>
                <Link to="/communitysearch">검색하기</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="community-right">
          <div>
            <h3 id="community_title">시야 커뮤니티</h3>
          </div>

          <div className="post-list">
            {posts.map((post) => (
              <Link
                to={`/community/${post.postDocumentId}`}
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
                      <span className="post-nickname">{post.userNickname}</span>
                      <span className="post-date">
                        {new Date(post.postTimeStamp).toLocaleString(
                          "ko-KR",
                          dateTimeOptions
                        )}
                      </span>
                      <span className="post-comments">
                        💬 {post.commentCount || 0}
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
            ))}
          </div>

          <button
            className="floating-add-button"
            onClick={() => navigate("/communityaddpost")} // 커뮤니티 글 작성 페이지 구현 후 수정 예정
          >
            <span className="plus-symbol">+</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityView;
