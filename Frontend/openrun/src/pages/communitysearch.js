// 커뮤니티 검색 -> api 연결 완료

import React, { useState, useMemo, useCallback, useEffect } from "react";
import Nav from "../components/nav";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "../css/community.css";
import { communitydata } from "../mocks/communitymocks";
import logo from "../components/logo2.png";

const API_BASE_URL = process.env.REACT_APP_API_BASE;

const apiService = {
  // ⭐️ GET: 글 목록 조회 (검색 및 태그 필터링 포함)
  getSearchResults: async (token, tag, keyword) => {
    // 1. 기본 URL 설정
    let url = `/api/community/posts?`;

    // 2. 태그 파라미터 추가 (선택된 태그가 '전체'가 아닐 경우만)
    if (tag && tag !== "전체") {
      url += `tag=${encodeURIComponent(tag)}&`;
    }

    // 3. 검색어 파라미터 추가 (검색어가 있을 경우만)
    if (keyword) {
      url += `q=${encodeURIComponent(keyword)}&`;
    }

    // 마지막 '&' 또는 '?' 제거 (선택 사항)
    url =
      url.slice(-1) === "&" || url.slice(-1) === "?" ? url.slice(0, -1) : url;

    console.log(`[API URL] ${url}`); // 확인용

    // ⭐️ 실제 API fetch 요청 구조 (이전 컴포넌트들과 동일)
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

const CommunitySearch = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  // [수정] 기간 대신 태그를 선택하는 상태
  const [selectedTag, setSelectedTag] = useState("전체");

  const uniqueTags = useMemo(() => {
    // "전체", "시야", "공연 후기", "공연 정보", "사담" 5가지 태그로 고정
    return ["전체", "시야", "공연 후기", "공연 정보", "사담"];
  }, []);

  const handleTagChange = useCallback((e) => {
    setSelectedTag(e.target.value);
  }, []);

  const handleSearch = () => {
    // 이미 searchTerm 상태가 변경될 때마다 useMemo로 필터링되지만,
    // 여기서는 명시적으로 검색을 시작하는 용도로 사용할 수 있습니다. (예: API 호출)
    console.log("검색 실행:", searchTerm, "태그:", selectedTag);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const fetchSearchResults = useCallback(
    async (tag, keyword) => {
      setLoading(true);
      setError(null);

      try {
        // 1. API 호출
        const responsePosts = await apiService.getSearchResults(
          token,
          tag,
          keyword
        );

        // 2. 성공 시 API 응답 사용
        setPosts(responsePosts);
        console.log(`[API SUCCESS] Search results loaded successfully.`);
      } catch (error) {
        // 3. API 호출 실패 시 Mock Fallback 로직 유지
        console.error(`[API FAIL] Falling back to Mock data.`, error.message);
        setError(error.message);

        // 4. Mock 데이터로 필터링 (프론트엔드 자체 검색 로직)
        let mockFiltered = communitydata;

        if (tag !== "전체") {
          mockFiltered = mockFiltered.filter(
            (post) => post.postTag && post.postTag.includes(tag)
          );
        }
        if (keyword.trim() !== "") {
          const lowerCaseKeyword = keyword.toLowerCase();
          mockFiltered = mockFiltered.filter(
            (post) =>
              (post.postTitle &&
                post.postTitle.toLowerCase().includes(lowerCaseKeyword)) ||
              (post.postContent &&
                post.postContent.toLowerCase().includes(lowerCaseKeyword)) ||
              (post.userNickname &&
                post.userNickname.toLowerCase().includes(lowerCaseKeyword))
          );
        }
        setPosts(mockFiltered);
      } finally {
        setLoading(false);
      }
    },
    [token]
  ); // token이 변경될 때만 재생성

  useEffect(() => {
    // 컴포넌트 마운트 시 (초기 상태: selectedTag="전체", searchTerm="") 전체 글 목록을 가져오며,
    // 이후 사용자가 검색 조건을 바꿀 때마다 새로운 검색 결과를 가져옵니다.
    fetchSearchResults(selectedTag, searchTerm);
  }, [fetchSearchResults, selectedTag, searchTerm]); // 의존성 배열에 검색 조건 포함
  
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
          <div className="community-search">
            <div className="dropdown-container">
              <select value={selectedTag} onChange={handleTagChange}>
                {uniqueTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
            <div className="communitysearch">
              <input
                type="text"
                placeholder="제목, 내용 또는 작성자를 검색하세요"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
          </div>

          {loading ? (
            <div className="loading-message">게시글을 불러오는 중입니다...</div>
          ) : posts.length === 0 ? (
            <div className="no-results">검색 결과가 없습니다.</div>
          ) : (
            <div className="post-list">
              {posts.map((post) => (
                <Link
                  to={`/community/${post.postDocumentId}`} 
                  key={post.postDocumentId}
                  className="post-item-link"
                >
                  <div className="post-item">
                    {/* ... (게시글 항목 UI는 동일) ... */}
                    <div className="post-content-wrap">
                      <div className="post-item-header">
                        <h4 className="post-title">
                          {post.postTitle.length > 22
                            ? post.postTitle.slice(0, 21) + "..."
                            : post.postTitle}
                        </h4>
                        {post.postTag &&
                          post.postTag.map((tag, index) => (
                            <span
                              key={index} 
                              className="post-tag"
                            >
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
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

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

export default CommunitySearch;
