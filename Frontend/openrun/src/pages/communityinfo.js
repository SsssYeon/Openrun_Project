// 공연 정보 커뮤니티 -> api 연결 완료

import React, { useState, useEffect, useCallback } from "react";
import Nav from "../components/nav";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "../css/community.css";
import { communitydata } from "../mocks/communitymocks";
import logo from "../components/logo2.png";

const API_BASE_URL = process.env.REACT_APP_API_BASE;
const TARGET_TAG = "공연 정보";

const apiService = {
  getPosts: async (token) => {
    const url = `/api/community/posts?tag=${encodeURIComponent(
      TARGET_TAG
    )}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, 
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return data.posts || data;
  },
};

const CommunityInfo = () => {
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
      const responsePosts = await apiService.getPosts(token);

      setPosts(responsePosts);
      console.log(`[API SUCCESS] All posts loaded successfully.`);
    } catch (error) {
      console.error(`[API FAIL] Falling back to Mock data.`, error.message);
      setError(error.message);

      const mockFiltered = communitydata.filter(
        (post) => post.postTag && post.postTag.includes(TARGET_TAG)
      );
      setPosts(mockFiltered);
    } finally {
      setLoading(false);
    }
  }, [token]); 

  useEffect(() => {
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
            <h3 id="community_title">공연 정보 커뮤니티</h3>
          </div>

          <div className="post-list">
            {loading ? (
              <p className="loading-message" style={{ textAlign: 'center', padding: '20px' }}>
                게시글 목록을 불러오는 중...
              </p>
            ) : posts.length === 0 ? (
              <p className="no-posts-message" style={{ textAlign: 'center', padding: '20px' }}>
                작성된 공연 정보 게시글이 없습니다.
              </p>
            ) : (
              posts.map((post) => (
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
              ))
            )}
          </div>

          <button
            className="floating-add-button"
            onClick={() => navigate("/communityaddpost")} 
          >
            <span className="plus-symbol">+</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityInfo;
