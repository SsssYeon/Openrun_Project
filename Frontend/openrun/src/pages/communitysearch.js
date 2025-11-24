// 커뮤니티 검색 -> api 연결 완료

import React, { useState, useMemo, useCallback, useEffect } from "react";
import Nav from "../components/nav";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "../css/community.css";
import { communitydata } from "../mocks/communitymocks";
import logo from "../components/logo2.png";

const API_BASE_URL = process.env.REACT_APP_API_BASE;

const apiService = {
  getSearchResults: async (token, tag, keyword) => {
    let url = `/api/community/posts?`;

    if (tag && tag !== "전체") {
      url += `tag=${encodeURIComponent(tag)}&`;
    }

    if (keyword) {
      url += `q=${encodeURIComponent(keyword)}&`;
    }

    url =
      url.slice(-1) === "&" || url.slice(-1) === "?" ? url.slice(0, -1) : url;

    console.log(`[API URL] ${url}`);

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

  const [selectedTag, setSelectedTag] = useState("전체");

  const uniqueTags = useMemo(() => {
    return ["전체", "시야", "공연 후기", "공연 정보", "사담"];
  }, []);

  const handleTagChange = useCallback((e) => {
    setSelectedTag(e.target.value);
    setLoading(true);
  }, []);

  const handleSearch = () => {
    console.log("검색 실행:", searchTerm, "태그:", selectedTag);
    setLoading(true);
    fetchSearchResults(selectedTag, searchTerm);
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
        const responsePosts = await apiService.getSearchResults(
          token,
          tag,
          keyword
        );

        setPosts(responsePosts);
        console.log(`[API SUCCESS] Search results loaded successfully.`);
      } catch (error) {
        console.error(`[API FAIL] Falling back to Mock data.`, error.message);
        setError(error.message);

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
  );

  useEffect(() => {
    if (searchTerm.trim() === "" && selectedTag === "전체") {
      setLoading(true);
      fetchSearchResults("전체", "");
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      fetchSearchResults(selectedTag, searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [fetchSearchResults, selectedTag, searchTerm]);

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
            <div
              className="loading-message"
              style={{ textAlign: "center", padding: "20px" }}
            >
              게시글을 검색 중...
            </div>
          ) : posts.length === 0 ? (
            <div
              className="no-results"
              style={{ textAlign: "center", padding: "20px" }}
            >
              검색 결과가 없습니다.
            </div>
          ) : (
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
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

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

export default CommunitySearch;
