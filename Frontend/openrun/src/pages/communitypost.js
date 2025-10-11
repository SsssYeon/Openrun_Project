// 커뮤니티 글 상세보기 페이지, 관극기록 상세보기 복붙해옴 -> 수정중....

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Nav from "../components/nav";
import "../css/communitypost.css";
import { communitydata } from "../mocks/communitymocks";
import { commentmocks } from "../mocks/communitycomment";

function CommunityPost() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentList, setCommentList] = useState([]);
  const [newCommentContent, setNewCommentContent] = useState("");

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
    // navigate(`/modifypost/${id}`);
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

// ... (생략) ...

// 🌟 현재 표시할 이미지 URL을 결정 (post가 null일 때 안전하게 처리)
const currentImageUrl =
    // post가 null이 아닐 때만 post.postImage[index]에 접근합니다.
    (post?.postImage && post.postImage[currentImageIndex]) 
    || "/default-poster.png"; // fallback (post.postImage가 없거나 유효하지 않을 때)


const showNavigation = post?.postImage?.length > 1;

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  // const isAuthor = token && communitydata.userId === token;

  // const handleReport = useCallback(() => {
  //   // 여기에 신고 처리 로직을 넣습니다.
  //   // console.log(`Reporting post ${id}`);
  //   // alert('게시글을 신고했습니다.');
  // }, [id]);

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
    </>
  );
}

export default CommunityPost;
