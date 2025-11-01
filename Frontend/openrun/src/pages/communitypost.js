// 커뮤니티 글 상세보기 페이지, api 연결 X

import React, { useState, useEffect, useCallback, useRef } from "react";

import { useParams, useNavigate } from "react-router-dom";

import Nav from "../components/nav";

import "../css/communitypost.css";

import { communitydata } from "../mocks/communitymocks";

import { commentmocks } from "../mocks/communitycomment";

const getUserIdFromToken = (token) => {
  if (token === "mock_user1_token") {
    return "user_a123"; // 현재 로그인 사용자 ID (토큰이 유효할 때)
  }

  if (token === "mock_user2_token") {
    return "user_a123";
  }

  return null; // 토큰이 없거나 유효하지 않을 때
};

// ⭐️ [추가] 이미지 모달 컴포넌트

const ImageModal = ({
  src,

  onClose,

  currentImageIndex,

  totalImages,

  onPrev,

  onNext,

  showNavigation,
}) => {
  if (!src) return null;

  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* 이미지 */}

        <img src={src} alt="상세 이미지" className="modal-image" />

        {/* 닫기 버튼 */}

        <button className="modal-close-btn" onClick={onClose}>
          X
        </button>

        {/* 네비게이션 버튼 (2장 이상일 때만 표시) */}

        {showNavigation && (
          <>
            <button className="modal-nav-btn modal-prev-btn" onClick={onPrev}>
              &lt;
            </button>

            <button className="modal-nav-btn modal-next-btn" onClick={onNext}>
              &gt;
            </button>

            <div className="modal-indicator">
              {currentImageIndex + 1} / {totalImages}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const CommentMenu = ({
  comment,

  currentUserId,

  onEdit,

  onDelete,

  onReport,

  onClose,
}) => {
  const isAuthor = comment.userId === currentUserId;

  const menuRef = useRef(null);

  // 메뉴 외부 클릭 시 닫기

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleActionClick = (action) => {
    onClose(); // 메뉴 닫기

    action(comment.commentDocumentId); // 해당 액션 실행
  };

  return (
    <div className="comment-menu-dropdown" ref={menuRef}>
      {isAuthor ? (
        // 작성자인 경우: 수정 및 삭제

        <>
          <button
            className="comment-menu-item"
            onClick={() => handleActionClick(onEdit)}
          >
            댓글 수정
          </button>

          <button
            className="comment-menu-item delete"
            onClick={() => handleActionClick(onDelete)}
          >
            댓글 삭제
          </button>
        </>
      ) : (
        // 작성자가 아닌 경우: 신고

        <button
          className="comment-menu-item report"
          onClick={() => handleActionClick(onReport)}
        >
          댓글 신고
        </button>
      )}
    </div>
  );
};

function CommunityPost() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [post, setPost] = useState(null);

  const [loading, setLoading] = useState(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [commentList, setCommentList] = useState([]);

  const [newCommentContent, setNewCommentContent] = useState("");

  const [showImageModal, setShowImageModal] = useState(false);

  const [openMenuId, setOpenMenuId] = useState(null);

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const currentUserId = getUserIdFromToken(token);

  useEffect(() => {
    setLoading(true);

    const foundPost = communitydata.find(
      (item) => String(item.postDocumentId) === id
    );

    if (foundPost) {
      setPost(foundPost);

      const filteredComments = commentmocks.filter(
        (comment) => String(comment.postDocumentId) === id
      );

      setCommentList(filteredComments);
    } else {
      console.error(`ID ${id}를 가진 커뮤니티 글을 찾을 수 없습니다.`);
    }

    setLoading(false);
  }, [id]); // 의존성 배열에 id만 남깁니다.

  const handleEdit = useCallback(() => {
    // 수정 페이지로 이동 로직 (Mock)

    navigate(`/modifypost/${id}`);

    // console.log(`Editing post ${id}`);
  }, [id, navigate]);

  const handleDelete = useCallback(() => {
    // window.confirm 대신 커스텀 모달을 띄웁니다.
    // setShowDeleteModal(true);
  }, []);

  const handleCommentSubmit = useCallback(() => {
    if (!newCommentContent.trim()) {
      // alert() 대신 콘솔에 경고 메시지 출력

      console.warn("댓글 내용을 입력해주세요.");

      return;
    }

    // 새 댓글 객체 생성 (Mock 데이터)

    const newComment = {
      postDocumentId: id,

      commentDocumentId: `cmt_${Date.now()}`, // 고유 ID 생성

      commentContent: newCommentContent,

      userId: "user_current", // 현재 사용자 ID (Mock)

      userNickname: "새로운_작성자", // 현재 사용자 닉네임 (Mock)

      dommentState: 0,

      commentTimeStamp: new Date().toISOString(), // 현재 시간

      commentReportCnt: 0,
    };

    // commendList 상태에 새 댓글을 추가 (Mock)

    // 새 댓글이 가장 위에 오도록 추가

    setCommentList((prevList) => [newComment, ...prevList]);

    setNewCommentContent(""); // 입력창 초기화

    console.log("새 댓글이 등록되었습니다:", newComment);
  }, [id, newCommentContent]);

  // ... (기존 상태 및 Hooks) ...

  // 🌟 추가할 상태: 현재 표시 중인 이미지의 인덱스

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // ... (기존 useEffect, handleEdit, handleDelete, handleCommentSubmit 함수) ...

  // 🌟 이전 이미지로 이동하는 함수

  const handlePrevImage = useCallback(() => {
    // post가 null이거나, post.postImage가 배열이 아니거나, 길이가 1 이하면 return

    if (!post?.postImage || post.postImage.length <= 1) return;

    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? post.postImage.length - 1 : prevIndex - 1
    );
  }, [post]); // post가 변경될 때마다 함수 재생성

  // 🌟 다음 이미지로 이동하는 함수

  const handleNextImage = useCallback(() => {
    // post가 null이거나, post.postImage가 배열이 아니거나, 길이가 1 이하면 return

    if (!post?.postImage || post.postImage.length <= 1) return;

    setCurrentImageIndex((prevIndex) =>
      prevIndex === post.postImage.length - 1 ? 0 : prevIndex + 1
    );
  }, [post]); // post가 변경될 때마다 함수 재생성

  // ⭐️ [추가] 이미지 클릭 시 모달 열기

  const handleImageClick = useCallback(() => {
    setShowImageModal(true);
  }, []);

  // ⭐️ [추가] 모달 닫기

  const handleCloseModal = useCallback(() => {
    setShowImageModal(false);
  }, []);

  // 🌟 현재 표시할 이미지 URL을 결정 (post가 null일 때 안전하게 처리)

  const currentImageUrl =
    // post가 null이 아닐 때만 post.postImage[index]에 접근합니다.

    (post?.postImage && post.postImage[currentImageIndex]) ||
    "/default-poster.png"; // fallback (post.postImage가 없거나 유효하지 않을 때)

  const showNavigation = post?.postImage?.length > 1;

  const handleCommentEdit = useCallback((commentId) => {
    console.log(`[댓글 수정] Comment ID: ${commentId} (수정 모달/인풋 표시)`);
  }, []);

  const handleCommentDelete = useCallback((commentId) => {
    console.log(`[댓글 삭제] Comment ID: ${commentId} (삭제 처리)`);

    setCommentList((prevList) =>
      prevList.filter((cmt) => cmt.commentDocumentId !== commentId)
    );
  }, []);

  const handleCommentReport = useCallback((commentId) => {
    console.log(`[댓글 신고] Comment ID: ${commentId} (신고 API 호출)`);

    alert("댓글을 신고했습니다."); // 테스트를 위해 alert 대신 console.log 사용
  }, []);

  // const isAuthor = token && communitydata.userId === token;

  // const handleReport = useCallback(() => {

  //   // 여기에 신고 처리 로직을 넣습니다.

  //   // console.log(`Reporting post ${id}`);

  //   // alert('게시글을 신고했습니다.');

  // }, [id]);

  const toggleCommentMenu = (commentId) => {
    setOpenMenuId((prevId) => (prevId === commentId ? null : commentId));
  };

  if (loading) return <div>불러오는 중...</div>;

  if (!post) return <div>해당 커뮤니티 글을 찾을 수 없습니다.</div>;

  const dateTimeOptions = {
    year: "numeric",

    month: "2-digit",

    day: "2-digit",

    hour: "2-digit",

    minute: "2-digit",

    hour12: false, // 24시간 형식
  };

  return (
    <>
      <div>
        <Nav />
      </div>

      <div className="community-post">
        <div className="event-buttons">
          {/* {isAuthor ? (

            // 작성자인 경우: 수정 및 삭제 버튼 표시

            <> */}

          <button className="edit-button" onClick={handleEdit}>
            수정
          </button>

          <button className="delete-button" onClick={handleDelete}>
            삭제
          </button>

          {/* </>

          ) : (

            // 작성자가 아니거나 토큰이 없는 경우: 신고 버튼 표시 (토큰 유무와 상관없이)

            <button className="delete-button" onClick={handleReport}>

              신고하기

            </button>

          )} */}
        </div>

        <div className="post-image-slider">
          {/* 이전 버튼 */}

          {showNavigation && (
            <button
              className="slider-nav-btn prev-btn"
              onClick={handlePrevImage}
            >
              &lt;
            </button>
          )}

          <img
            src={currentImageUrl || "/default-poster.png"}
            alt={`${post.postTitle} 이미지 ${currentImageIndex + 1}`}
            onClick={handleImageClick}
            className="post-poster"

            // 이미지 로드 실패 시 대체 이미지 표시
          />

          {/* 다음 버튼 */}

          {showNavigation && (
            <button
              className="slider-nav-btn next-btn"
              onClick={handleNextImage}
            >
              &gt;
            </button>
          )}
        </div>

        <div className="post-container">
          <div className="community-comment-content">
            <div className="community-post-first">
              <div className="post-nickname-date">
                <p>
                  <strong>작성자:</strong> {post.userNickname}
                </p>

                <p className="community-post-date">
                  {new Date(post.postTimeStamp).toLocaleString(
                    "ko-KR",

                    dateTimeOptions
                  )}
                </p>
              </div>

              <h3 className="community-post-title">{post.postTitle}</h3>

              <strong>태그:</strong>

              {post.postTag &&
                post.postTag.map((tag, index) => (
                  <span
                    key={index} // 배열을 순회할 때는 고유한 key를 지정해야 합니다.
                    className="community-post-tag"
                  >
                    {tag}
                  </span>
                ))}

              <p className="post-content">
                {post.postContent?.trim()
                  ? post.postContent
                  : "작성된 내용이 없습니다."}
              </p>
            </div>

            <div className="comment">
              <strong>댓글</strong>

              {commentList.length > 0 ? (
                commentList.map((comment) => (
                  <div key={comment.commentDocumentId} className="commend-id">
                    <div className="comment-detail">
                      <span className="comment-nickname">
                        {comment.userNickname}
                      </span>

                      <span className="comment-date">
                        {new Date(comment.commentTimeStamp).toLocaleString(
                          "ko-KR",

                          dateTimeOptions
                        )}
                      </span>

                      <button
                        className="comment-menu-btn"
                        onClick={() =>
                          toggleCommentMenu(comment.commentDocumentId)
                        }
                        aria-expanded={openMenuId === comment.commentDocumentId}
                        aria-controls={`menu-${comment.commentDocumentId}`}
                        title="댓글 옵션"
                      >
                        &#x22EE; {/* 수직 3점 기호 (Vertical Ellipsis) */}
                      </button>

                      {/* ⭐️ 메뉴 드롭다운 표시 */}

                      {openMenuId === comment.commentDocumentId && (
                        <CommentMenu
                          comment={comment}
                          currentUserId={currentUserId}
                          onEdit={handleCommentEdit}
                          onDelete={handleCommentDelete}
                          onReport={handleCommentReport}
                          onClose={() => setOpenMenuId(null)}
                        />
                      )}
                    </div>

                    <p className="comment-content">{comment.commentContent}</p>
                  </div>
                ))
              ) : (
                <div className="comment-none">
                  아직 작성된 댓글이 없습니다. 첫 댓글을 남겨보세요!
                </div>
              )}
            </div>

            <div className="write-comment">
              <textarea
                className="write-comment-placeholder"
                placeholder="댓글 달기"
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
              />

              <div>
                <button className="write-comment-button">게시</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showImageModal && (
        <ImageModal
          src={currentImageUrl}
          onClose={handleCloseModal}
          currentImageIndex={currentImageIndex}
          totalImages={post.postImage.length}
          onPrev={handlePrevImage}
          onNext={handleNextImage}
          showNavigation={showNavigation}
        />
      )}
    </>
  );
}

export default CommunityPost;
