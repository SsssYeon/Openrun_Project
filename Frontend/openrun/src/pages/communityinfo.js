// 공연 정보 커뮤니티 -> api 연결 안해놓음

import React from "react";
import Nav from "../components/nav";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "../css/community.css";
import { communitydata } from "../mocks/communitymocks";
import logo from "../components/logo2.png";

const CommunityInfo = () => {
  const navigate = useNavigate();

  const infoPosts = communitydata.filter(
    (post) => post.postTag && post.postTag.includes("공연 정보")
  );

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
          <div>
            <h3 id="community_title">공연 정보 커뮤니티</h3>
          </div>

          <div className="post-list">
            {infoPosts.map((post) => (
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

export default CommunityInfo;
