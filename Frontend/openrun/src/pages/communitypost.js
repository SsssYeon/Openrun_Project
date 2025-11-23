// 커뮤니티 글 상세보기 페이지, api 연결 완료

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Nav from "../components/nav";
import "../css/communitypost.css";
import { communitydata } from "../mocks/communitymocks";
import { commentmocks } from "../mocks/communitycomment";

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

const fetchCurrentUserId = async (token) => {
  if (!token) return null;

  if (token === "mock_user1_token" || token === "mock_user2_token") {
    return "user_a123";
  }

  try {
    const response = await fetch(`/api/user/current-id`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const data = await response.json();
      return data.userId;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch current user ID:", error);
    return null;
  }
};

const apiService = {
  getPostDetail: async (postId, token) => {
    if (Math.random() < 0.1) {
      throw new Error("API_CALL_FAILED_SIMULATION");
    }

    const response = await fetch(`/api/community/posts/${postId}`, {
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

    return {
      post: data.post || data,
      comments:
        data.comments ||
        commentmocks.filter((c) => String(c.postDocumentId) === postId),
    };
  },

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

  createComment: async (postId, token, commentContent) => {
    const response = await fetch(`/api/community/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ commentContent }),
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error("401_UNAUTHORIZED_COMMENT");
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      commentDocumentId: data.commentDocumentId,
      isAuthor: data.isAuthor,
      userNickname: data.userNickname,
      commentTimeStamp: data.commentTimeStamp,
    };
  },

  deleteComment: async (commentId, token) => {
    const response = await fetch(`/api/community/comments/${commentId}`, {
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

  reportItem: async (endpoint, itemId, token) => {
    const response = await fetch(`/api/${endpoint}/${itemId}/reports`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

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

  const isLoggedIn = !!token;

  useEffect(() => {
    const fetchPostDetail = async () => {
      setLoading(true);

      try {
        const response = await apiService.getPostDetail(id, token);

        const postData = response.post || response;

        const finalIsAuthor = postData.isAuthor || false;

        setPost({
          ...postData,
          isAuthor: finalIsAuthor,
        });

        const commentsWithAuth = (response.comments || [])
          .map((c) => {
            const finalIsAuthor = c.isAuthor || false;
            return {
              ...c,
              isAuthor: finalIsAuthor,
            };
          })
          .sort(
            (a, b) =>
              new Date(b.commentTimeStamp) - new Date(a.commentTimeStamp)
          );

        setCommentList(commentsWithAuth);

        console.log("[API SUCCESS/MOCK FALLBACK] Post detail loaded.");
      } catch (error) {
        console.error("[API FAIL] Falling back to Mock data.", error.message);

        const foundPost = communitydata.find(
          (p) => String(p.postDocumentId) === id
        );

        if (foundPost) {
          const finalIsAuthor = foundPost.isAuthor || false;
          const postWithAuth = { ...foundPost, isAuthor: finalIsAuthor };

          setPost(postWithAuth);
          setCommentList(commentsWithAuth);
        } else {
          setPost(null); 
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetail();
  }, [id, token]); 

  const commentsWithAuth = commentmocks
    .filter((c) => String(c.postDocumentId) === id)
    .map((c) => {
      const finalCommentIsAuthor = c.isAuthor || false;
      return { ...c, isAuthor: finalCommentIsAuthor };
    })
    .sort(
      (a, b) => new Date(b.commentTimeStamp) - new Date(a.commentTimeStamp)
    );

  const handleEdit = useCallback(() => {

    navigate(`/modifypost/${id}`);

  }, [id, navigate]);

  const handleDelete = useCallback(async () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await apiService.deletePost(id, token);
        alert("게시글이 삭제되었습니다.");

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
        await apiService.reportItem("community/posts", id, token); 
        alert("게시글을 신고했습니다.");
      } catch (error) {
        console.error(`[API ERROR] 신고 실패: ${error.message}`);
        alert("신고 처리 중 오류가 발생했습니다.");
      }
    }
  }, [id, isLoggedIn, token]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePrevImage = useCallback(() => {
    if (!post?.postImage || post.postImage.length <= 1) return;
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? post.postImage.length - 1 : prevIndex - 1
    );
  }, [post]); 

  const handleNextImage = useCallback(() => {
    if (!post?.postImage || post.postImage.length <= 1) return;
    setCurrentImageIndex((prevIndex) =>
      prevIndex === post.postImage.length - 1 ? 0 : prevIndex + 1
    );
  }, [post]); 
  const handleImageClick = useCallback(() => {
    setShowImageModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowImageModal(false);
  }, []);

  const currentImageUrl =
    (post?.postImage && post.postImage[currentImageIndex]) ||
    "/default-poster.png";

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

      const newComment = {
        postDocumentId: id,
        commentDocumentId: result.commentDocumentId,
        commentContent: newCommentContent, 
        userNickname: result.userNickname,
        commentTimeStamp: result.commentTimeStamp,
        isAuthor: result.isAuthor || false, 
      };

      setCommentList((prevList) => [newComment, ...prevList]);
      setNewCommentContent("");
      alert("댓글이 성공적으로 등록되었습니다.");
    } catch (error) {
      console.error(`[API ERROR] 댓글 작성 실패: ${error.message}`);
      alert("댓글 등록 중 오류가 발생했습니다.");
    }
  }, [id, newCommentContent, isLoggedIn, token]);

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
          alert("댓글이 성공적으로 삭제되었습니다.");
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
          await apiService.reportItem("community/comments", commentId, token); 
          alert("댓글을 신고했습니다.");
        } catch (error) {
          console.error(`[API ERROR] 신고 실패: ${error.message}`);
          alert("신고 처리 중 오류가 발생했습니다.");
        }
      }
    },
    [isLoggedIn, token]
  );

  const renderWithLineBreaks = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index !== text.split("\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

  if (loading)
    return (
      <div>
        <Nav />
        <div
          className="community-container"
          style={{ textAlign: "center", marginTop: "100px" }}
        >
          불러오는 중...
        </div>
      </div>
    );
  if (!post || post.postState === 1)
    return <div>숨겨진 글이거나, 해당 커뮤니티 글을 찾을 수 없습니다.</div>;

  const dateTimeOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, 
  };

  return (
    <>
      <div>
        <Nav />
      </div>
      <div className="community-post">
        <div className="event-buttons">
          {post?.isAuthor ? (
            <>
              <button className="edit-button" onClick={handleEdit}>
                수정
              </button>
              <button className="delete-button" onClick={handleDelete}>
                삭제
              </button>
            </>
          ) : (
            isLoggedIn && (
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
                    key={index}
                    className="community-post-tag"
                  >
                    {tag}
                  </span>
                ))}
              <p className="post-content">
                {post.postContent?.trim()
                  ? renderWithLineBreaks(post.postContent)
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
                      <div className="comment-actions">
                        {comment.isAuthor ? (
                          <>
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
                          isLoggedIn && (
                            <button
                              className="comment-action-btn report"
                              onClick={() =>
                                handleCommentReport(comment.commentDocumentId)
                              }
                            >
                              신고
                            </button>
                          )
                        )}
                      </div>
                    </div>
                    <p className="comment-content">
                      {
                        comment.isHidden ? (
                          <em>[숨겨진 댓글입니다.]</em>
                        ) : (
                          renderWithLineBreaks(comment.commentContent)
                        ) 
                      }
                    </p>
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
