// 커뮤니티 검색 -> api 연결 안해놓음

import React, { useState, useMemo, useCallback } from "react";
import Nav from "../components/nav";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "../css/community.css";
import { communitydata } from "../mocks/communitymocks";
import logo from "../components/logo2.png";

const CommunitySearch = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // [수정] 기간 대신 태그를 선택하는 상태
  const [selectedTag, setSelectedTag] = useState("전체");

  const uniqueTags = useMemo(() => {
    // "전체", "시야", "공연 후기", "공연 정보", "사담" 5가지 태그로 고정
    return ["전체", "시야", "공연 후기", "공연 정보", "사담"];
  }, []);

  const handleTagChange = useCallback((e) => {
    setSelectedTag(e.target.value);
  }, []);

  const displayedPosts = useMemo(() => {
    let filtered = communitydata;

    // 태그 필터링
    if (selectedTag !== "전체") {
      // "시야" 페이지이므로, 기본적으로 '시야'를 포함하고,
      // 드롭다운에서 선택된 태그도 포함하는 글만 필터링합니다.
      filtered = filtered.filter(
        (communitydata) => communitydata.postTag && communitydata.postTag.includes(selectedTag)
      );
    }

    // 검색어 필터링
    if (searchTerm.trim() !== "") {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (communitydata) =>
          (communitydata.postTitle &&
            communitydata.postTitle.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (communitydata.postContent &&
            communitydata.postContent.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (communitydata.userNickname &&
            communitydata.userNickname.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }

    return filtered;
  }, [communitydata, selectedTag, searchTerm]);
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

  const dateTimeOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
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

          <div className="post-list">
            {displayedPosts.map((post) => (
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
                          <span
                            key={index} // 배열을 순회할 때는 고유한 key를 지정해야 합니다.
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
                        {new Date(post.postTimeStamp).toLocaleString("ko-KR", dateTimeOptions)}
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
                          : // 그렇지 않으면 (postImage가 배열이 아니거나 비어있으면) logo를 사용
                            logo
                      } // postImage가 있으면 사용, 없으면 logo 사용
                      alt={post.postTitle}
                      className="post-thumbnail"
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

export default CommunitySearch;
