// 커뮤니티 글 상세보기 페이지, api 연결 완료
// 글 상세보기, 삭제, 신고 + 댓글 작성, 삭제, 신고 연결 완료

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Nav from "../components/nav";
import "../css/communitypost.css";
import { communitydata } from "../mocks/communitymocks";
import { commentmocks } from "../mocks/communitycomment";

const API_BASE_URL = process.env.REACT_APP_API_BASE;

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

const apiService = {
  // ⭐️ GET: 글 상세 조회 (/api/community/posts/{postId})
  getPostDetail: async (postId, token) => {
    // 10% 확률로 API 호출 실패 시뮬레이션 (네트워크 오류/CORS 등)
    if (Math.random() < 0.1) {
      throw new Error("API_CALL_FAILED_SIMULATION");
    }

    const response = await fetch(`/api/community/posts/${postId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // 토큰 전송
        "Content-Type": "application/json",
      },
    });

    // HTTP 상태 코드 검증 (200 OK가 아니면 오류 throw)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // ⭐️ 서버 응답 형태 가정 (post와 comments 모두 isAuthor 플래그 포함)
    // 실제 API 연결 시 commentmocks 부분 제거 필요
    return {
      post: data.post || data,
      comments:
        data.comments ||
        commentmocks.filter((c) => String(c.postDocumentId) === postId),
    };
  },

  // ⭐️ PATCH: 글 수정 (/api/community/posts/{postId})
  updatePost: async (postId, token, updateData) => {
    const response = await fetch(`/api/community/posts/${postId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      if (response.status === 403)
        throw new Error("403_FORBIDDEN_API_VERIFICATION");
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return { success: true };
  },

  // ⭐️ DELETE: 글 삭제 (/api/community/posts/{postId})
  deletePost: async (postId, token) => {
    const response = await fetch(`/api/community/posts/${postId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      if (response.status === 403)
        throw new Error("403_FORBIDDEN_API_VERIFICATION");
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return { success: true };
  },

  // ⭐️ POST: 댓글 작성 (/api/community/posts/{postId}/comments)
  createComment: async (postId, token, commentContent) => {
    const response = await fetch(
      `/api/community/posts/${postId}/comments`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commentContent }),
      }
    );

    if (!response.ok) {
      if (response.status === 401) throw new Error("401_UNAUTHORIZED_COMMENT");
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // ⭐️ 서버 응답: isAuthor, ID, nickname, timestamp 포함 가정
    return {
      commentDocumentId: data.commentDocumentId,
      isAuthor: data.isAuthor,
      userNickname: data.userNickname,
      commentTimeStamp: data.commentTimeStamp,
    };
  },

  // ⭐️ PATCH: 댓글 수정 (/api/community/comments/{commentId})
  // updateComment: async (commentId, token, updateData) => {
  //   const response = await fetch(
  //     `${API_BASE_URL}/community/comments/${commentId}`,
  //     {
  //       method: "PATCH",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(updateData),
  //     }
  //   );

  //   if (!response.ok) {
  //     if (response.status === 403)
  //       throw new Error("403_FORBIDDEN_API_VERIFICATION");
  //     throw new Error(`HTTP error! status: ${response.status}`);
  //   }
  //   return { success: true };
  // },

  // ⭐️ DELETE: 댓글 삭제 (/api/community/comments/{commentId})
  deleteComment: async (commentId, token) => {
    const response = await fetch(
      `/api/community/comments/${commentId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      if (response.status === 403)
        throw new Error("403_FORBIDDEN_API_VERIFICATION");
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return { success: true };
  },

  // ⭐️ POST: 댓글/글 신고 (/api/community/posts/{postId}/reports 또는 /api/community/comments/{commentId}/reports)

  reportItem: async (endpoint, itemId, token) => {
    const response = await fetch(
      `/api/${endpoint}/${itemId}/reports`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      if (response.status === 401) throw new Error("401_UNAUTHORIZED_REPORT");
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return { success: true };
  },
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
  const isLoggedIn = !!currentUserId;

   // ⭐ 메인 데이터 패칭 useEffect
    useEffect(() => {
        const fetchPostDetail = async () => {
            setLoading(true); // fetch 시작 시 로딩 상태 설정

            try {
                // 1. API 호출 시도
                const response = await apiService.getPostDetail(id, token);

                // 2. 성공 시 API 응답 사용 (isAuthor 플래그 포함)
                const isAuthor = response.post?.userId === currentUserId;

                setPost({ ...response.post, isAuthor });
                
                // 댓글에도 isAuthor 플래그 추가 (서버가 주지 않을 경우 클라이언트 측 계산)
                const commentsWithAuth = response.comments
                    .map(c => ({ ...c, isAuthor: c.userId === currentUserId }))
                    .sort((a, b) => new Date(b.commentTimeStamp) - new Date(a.commentTimeStamp));

                setCommentList(commentsWithAuth);

                console.log("[API SUCCESS/MOCK FALLBACK] Post detail loaded.");
            } catch (error) {
                // 3. API 호출 실패 (네트워크 오류, 404, Mock 실패 시뮬레이션 등)
                console.error("[API FAIL] Falling back to Mock data.", error.message);

                // 4. Mock Fallback 로직 (API 서비스 내부에서 처리하지 않았을 경우)
                const foundPost = communitydata.find(
                    (p) => String(p.postDocumentId) === id
                );
                
                if (foundPost) {
                    const isAuthor = foundPost.userId === currentUserId;
                    const postWithAuth = { ...foundPost, isAuthor };

                    const commentsWithAuth = commentmocks
                        .filter((c) => String(c.postDocumentId) === id)
                        .map((c) => ({
                            ...c,
                            isAuthor: c.userId === currentUserId,
                        }))
                        .sort(
                            (a, b) =>
                                new Date(b.commentTimeStamp) - new Date(a.commentTimeStamp)
                        );
                    
                    setPost(postWithAuth);
                    setCommentList(commentsWithAuth);
                } else {
                    setPost(null); // Mock 데이터도 없는 경우
                }
            } finally {
                setLoading(false); // fetch 완료 시 로딩 상태 해제
            }
        };

        fetchPostDetail();
    }, [id, token, currentUserId]); // token과 currentUserId가 변경되면 재호출

  // const handleEdit = useCallback(async () => {
  //   if (!post?.isAuthor) {
  //     console.error("수정 권한이 없습니다.");
  //     return;
  //   }

  //   try {
  //     // API 호출 시도 (Mock Service를 통해 서버 검증 시뮬레이션)
  //     await apiService.updatePost(id, token, {
  //       title: post.postTitle,
  //       content: "Updated Content",
  //     });
  //     alert("게시글 수정 요청이 성공적으로 서버에 전달되었습니다. (Mock)");
  //     // 성공 시 수정 페이지로 이동
  //     navigate(`/modifypost/${id}`);
  //   } catch (error) {
  //     console.error(`[API ERROR] 수정 실패: ${error.message}`);
  //     if (error.message.includes("403_FORBIDDEN")) {
  //       alert("수정 권한이 없습니다.");
  //     } else {
  //       alert("게시글 수정 중 오류가 발생했습니다.");
  //     }
  //   }
  // }, [id, navigate, post, token]);
  const handleEdit = useCallback(() => {
    // 수정 페이지로 이동 로직 (Mock)

    navigate(`/modifypost/${id}`);

    // console.log(`Editing post ${id}`);
  }, [id, navigate]);

  // ⭐️ 글 삭제: DELETE API 연결
  const handleDelete = useCallback(async () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        // API 호출 시도 (Mock Service를 통해 서버 검증 시뮬레이션)
        await apiService.deletePost(id, token);
        alert("게시글 삭제 요청이 성공적으로 서버에 전달되었습니다. (Mock)");

        // 성공 시 목록으로 이동
        navigate("/community");
      } catch (error) {
        console.error(`[API ERROR] 삭제 실패: ${error.message}`);
        if (error.message.includes("403_FORBIDDEN")) {
          alert("삭제 권한이 없습니다.");
        } else {
          alert("게시글 삭제 중 오류가 발생했습니다.");
        }
      }
    }
  }, [id, navigate, post, token]);

  const handleReport = useCallback(async () => {
    if (!isLoggedIn) {
      alert("로그인 후 신고할 수 있습니다.");
      return;
    }

    if (window.confirm("정말 신고하시겠습니까?")) {
      try {
        await apiService.reportItem("/community/posts", id, token); // ⭐️ 글 신고 API 호출
        alert("게시글을 신고했습니다.");
      } catch (error) {
        console.error(`[API ERROR] 신고 실패: ${error.message}`);
        alert("신고 처리 중 오류가 발생했습니다.");
      }
    }
  }, [id, isLoggedIn, token]);

  // 🌟 추가할 상태: 현재 표시 중인 이미지의 인덱스
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  const handleCommentSubmit = useCallback(async () => {
    if (!isLoggedIn) {
      alert("로그인 후 댓글을 작성해주세요.");
      return;
    }
    if (!newCommentContent.trim()) {
      console.warn("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      // API 호출
      const result = await apiService.createComment(
        id,
        token,
        newCommentContent
      );

      // 새 댓글 객체 생성 (API 응답 데이터와 입력 내용 결합)
      const newComment = {
        postDocumentId: id,
        commentDocumentId: result.commentDocumentId,
        commentContent: newCommentContent, // 클라이언트 입력 내용
        userId: currentUserId, // 클라이언트에서 아는 ID (서버가 검증)
        userNickname: result.userNickname,
        commentTimeStamp: result.commentTimeStamp,
        isAuthor: result.isAuthor, // 서버가 반환한 isAuthor 플래그
      };

      setCommentList((prevList) => [newComment, ...prevList]);
      setNewCommentContent("");
      alert("댓글이 성공적으로 등록되었습니다. (Mock)");
    } catch (error) {
      console.error(`[API ERROR] 댓글 작성 실패: ${error.message}`);
      alert("댓글 등록 중 오류가 발생했습니다.");
    }
  }, [id, newCommentContent, isLoggedIn, currentUserId, token]);

  // const handleCommentEdit = useCallback((commentId) => {
  //   console.log(`[댓글 수정] Comment ID: ${commentId} (수정 모달/인풋 표시)`);
  // }, []);

  const handleCommentDelete = useCallback(
    async (commentId) => {
      const commentToDelete = commentList.find(
        (c) => c.commentDocumentId === commentId
      );

      if (window.confirm("정말 삭제하시겠습니까?")) {
        try {
          await apiService.deleteComment(commentId, token);

          setCommentList((prevList) =>
            prevList.filter((cmt) => cmt.commentDocumentId !== commentId)
          );
          alert("댓글이 성공적으로 삭제되었습니다. (Mock)");
        } catch (error) {
          console.error(`[API ERROR] 댓글 삭제 실패: ${error.message}`);
          alert("댓글 삭제 중 오류가 발생했습니다.");
        }
      }
    },
    [commentList, token]
  );

  const handleCommentReport = useCallback(
    async (commentId) => {
      if (!isLoggedIn) {
        alert("로그인 후 신고할 수 있습니다.");
        return;
      }

      if (window.confirm("정말 신고하시겠습니까?")) {
        try {
          await apiService.reportItem("/community/comments", commentId, token); // ⭐️ 댓글 신고 API 호출
          alert("댓글을 신고했습니다.");
        } catch (error) {
          console.error(`[API ERROR] 신고 실패: ${error.message}`);
          alert("신고 처리 중 오류가 발생했습니다.");
        }
      }
    },
    [isLoggedIn, token]
  );

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
          {post?.isAuthor ? (
            // 작성자인 경우: 수정 및 삭제 버튼 표시
            <>
              <button className="edit-button" onClick={handleEdit}>
                수정
              </button>
              <button className="delete-button" onClick={handleDelete}>
                삭제
              </button>
            </>
          ) : (
            // 작성자가 아니지만 로그인한 경우: 신고 버튼 표시
            !post?.isAuthor && (
              <button className="delete-button" onClick={handleReport}>
                신고
              </button>
            )
          )}
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
                      <div className="comment-info">
                        <span className="comment-nickname">
                          {comment.userNickname}
                        </span>
                        <span className="comment-date">
                          {new Date(comment.commentTimeStamp).toLocaleString(
                            "ko-KR",
                            dateTimeOptions
                          )}
                        </span>
                      </div>
                      {/* ⭐️ 댓글 인라인 액션 버튼 */}
                      <div className="comment-actions">
                        {comment.isAuthor ? (
                          // 작성자: 수정 및 삭제
                          <>
                            {/* <button
                              className="comment-action-btn edit"
                              onClick={() =>
                                handleCommentEdit(comment.commentDocumentId)
                              }
                            >
                              수정
                            </button> */}
                            <button
                              className="comment-action-btn delete"
                              onClick={() =>
                                handleCommentDelete(comment.commentDocumentId)
                              }
                            >
                              삭제
                            </button>
                          </>
                        ) : (
                          // 비작성자: 로그인 상태일 때만 신고 버튼 노출
                          <button
                            className="comment-action-btn report"
                            onClick={() =>
                              handleCommentReport(comment.commentDocumentId)
                            }
                          >
                            신고
                          </button>
                        )}
                      </div>
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
                <button
                  className="write-comment-button"
                  onClick={handleCommentSubmit}
                  disabled={!isLoggedIn}
                >
                  게시
                </button>
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
