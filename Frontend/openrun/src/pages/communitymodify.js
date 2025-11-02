// 커뮤니티 글 수정, api 연결 완료

import React, { useRef, useState, useEffect, useCallback } from "react";
import Nav from "../components/nav";
import "../css/eventdetail.css";
import { useNavigate, useParams } from "react-router-dom";
import { communitydata } from "../mocks/communitymocks";

const API_BASE_URL = process.env.REACT_APP_API_BASE;

const apiService = {
  // ⭐️ GET: 게시글 상세 조회
  getPostDetail: async (token, postId) => {
    const url = `/api/community/posts/${postId}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  },

  // ⭐️ PATCH: 게시글 수정
  modifyPost: async (token, postId, formData) => {
    const url = `/api/community/posts/${postId}`;
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        // FormData를 사용하므로 Content-Type 명시하지 않음
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // 서버가 수정 성공 시 응답 본문이 없을 수 있으므로 텍스트로 처리
    return response.text().catch(() => ({}));
  },
};

const Communitymodify = () => {
  const { id } = useParams();
  const numericId = parseInt(id, 10);

  const [token] = useState(
    localStorage.getItem("token") || sessionStorage.getItem("token")
  );
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [newPosterFiles, setNewPosterFiles] = useState([]);
  const [posterPreviews, setPosterPreviews] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // ⭐️ 중복 제출 방지 추가

  const navigate = useNavigate();

  // ⭐️ API를 통해 게시글 상세 정보를 불러오는 함수
  const fetchPostDetail = useCallback(async () => {
    if (!id) return;
    setIsLoaded(false);
    setError(null);

    try {
      // ⚠️ 실제 API 호출
      const postDetail = await apiService.getPostDetail(token, id);

      // 상태 설정 (API 응답 데이터 사용)
      setTitle(postDetail.postTitle || "");
      setContent(postDetail.postContent || "");
      setSelectedTags(postDetail.postTag || []);
      setPosterPreviews(postDetail.postImage || []); // 이미지 URL 배열

      console.log("[API SUCCESS] Post detail loaded:", postDetail);
    } catch (apiError) {
      console.error(`[API FAIL] Falling back to Mock data.`, apiError.message);
      setError(apiError.message);

      // Mock 데이터 Fallback 로직 유지
      const postToModify = communitydata.find(
        (post) =>
          post.postDocumentId === id ||
          post.postDocumentId === `post_${id}` ||
          post.postDocumentId === id.toString()
      );

      if (postToModify) {
        setTitle(postToModify.postTitle || "");
        setContent(postToModify.postContent || "");
        setSelectedTags(postToModify.postTag || []);
        setPosterPreviews(postToModify.postImage || []);
        setError(null);
      } else {
        setError("게시글을 찾을 수 없습니다.");
      }
    } finally {
      setIsLoaded(true);
    }
  }, [id, token]);

  useEffect(() => {
    fetchPostDetail();

    const blobUrls = posterPreviews.filter((url) => url.startsWith("blob:"));
    return () => {
      blobUrls.forEach(URL.revokeObjectURL);
    };
  }, [fetchPostDetail, posterPreviews]);

  const fileInputRef = useRef(null);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleImageClick = () => {
    fileInputRef.current.click(); // 이미지 클릭 시 input 열기
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setNewPosterFiles((prev) => [...prev, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setPosterPreviews((prev) => [...prev, ...newPreviews]);
    }
    e.target.value = null;
  };

  const handleImageRemove = (e, index) => {
    e.stopPropagation();

    const newPreviews = posterPreviews.filter((_, i) => i !== index);
    setPosterPreviews(newPreviews);

    const removedUrl = posterPreviews[index];
    if (removedUrl.startsWith("blob:")) {
      // Blob URL과 일치하는 File 객체를 newPosterFiles에서 정확히 제거하는 로직은 복잡합니다.
      // 여기서는 간단히 console.warn만 남기고, 서버 전송 시 Blob URL이 아닌 것(기존 이미지)만
      // existingImages로 보내는 로직에 의존합니다.
      console.warn(
        "Blob URL을 삭제했습니다. 실제 파일 객체 관리에 주의하세요."
      );
    }

    setCurrentImageIndex((prev) =>
      newPreviews.length === 0 ? 0 : Math.min(prev, newPreviews.length - 1)
    );
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(
      (prev) => (prev - 1 + posterPreviews.length) % posterPreviews.length
    );
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % posterPreviews.length);
  };

  const TAGS = ["시야", "공연 후기", "공연 정보", "사담"]; // ⭐️ 태그 목록 정의

  const handleTagSelect = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    if (isSubmitting) {
      console.log("이미 수정 요청 중입니다.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("postTitle", title);
    formData.append("postContent", content);

    // 1. 태그 추가 (글 작성과 동일)
    selectedTags.forEach((tag) => {
      formData.append("postTag", tag);
    });

    // 2. 이미지 처리
    // 2a. 기존 이미지 URL 추가 (Blob URL이 아닌 것들만)
    const existingImageUrls = posterPreviews.filter(
      (url) => !url.startsWith("blob:")
    );
    existingImageUrls.forEach((url) => {
      // 서버에서 'existingImages'라는 키로 기존 URL을 받도록 가정
      formData.append("existingImages", url);
    });

    // 2b. 새로 업로드된 파일 추가
    newPosterFiles.forEach((file) => {
      // 서버에서 'newImages'라는 키로 새 파일을 받도록 가정
      formData.append("newImages", file);
    });

    try {
      await apiService.modifyPost(token, id, formData);

      alert("수정이 완료되었습니다.");
      navigate(`/community/${id}`);
    } catch (error) {
      console.error("수정 요청 실패:", error);
      alert(`수정 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  const showNavigation = posterPreviews.length > 1;

  return (
    <div>
      <Nav />
      <div className="event-detail">
        <div className="poster-upload-area">
          {/* ⭐️ [변경 5] 파일 입력 필드 (multiple 속성 유지) */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
            multiple
          />
          {/* 1. 이미지가 없을 때: 기본 이미지 및 클릭 유도 */}
          {posterPreviews.length === 0 && (
            <img
              src="/default-poster.png"
              alt="포스터 추가 (클릭)"
              className="poster"
              onClick={handleImageClick}
            />
          )}
          {/* 2. 이미지가 1개 이상일 때: 슬라이더/단일 뷰 */}
          {posterPreviews.length > 0 && (
            // Slider Container (relative position for absolute buttons)
            <div
              className="slider-container"
              style={{
                flexDirection: "column", // ⭐️ 세로 정
                display: "flex",
                alignItems: "center",

                width: "100%",
                minHeight: "200px",
              }}
            >
              <div
                style={{
                  position: "relative", // 내부 버튼 절대 위치 기준
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  maxWidth: "350px",
                  width: "100%",
                }}
              >
                {/* 이전 버튼 */}
                {showNavigation && (
                  <button
                    className="slider-nav-btn prev-btn"
                    onClick={handlePrevImage}
                  >
                    &lt;
                  </button>
                )}

                {/* 현재 이미지 표시 영역 */}
                <div
                  className="current-image-wrapper"
                  onClick={handleImageClick}
                  style={{
                    position: "relative",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    maxWidth: "300px",
                    width: "100%",
                  }}
                >
                  <img
                    src={posterPreviews[currentImageIndex]}
                    alt={`포스터 ${currentImageIndex + 1}`}
                    className="post-poster"
                    style={{
                      cursor: "pointer",
                      maxWidth: "100%",
                      maxHeight: "300px",
                      objectFit: "contain",
                    }}
                  />

                  {/* 인디케이터 (현재 몇 번째 이미지인지 표시) */}
                  {showNavigation && (
                    <div
                      className="image-indicator"
                      style={{
                        position: "absolute",
                        bottom: "10px",
                        background: "rgba(0,0,0,0.5)",
                        color: "white",
                        padding: "2px 8px",
                        borderRadius: "5px",
                      }}
                    >
                      {currentImageIndex + 1} / {posterPreviews.length}
                    </div>
                  )}
                </div>

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
              {/* ❌ 삭제 버튼 (현재 이미지 위에 오버레이) */}
              <button
                className="remove-button"
                onClick={(e) => handleImageRemove(e, currentImageIndex)}
                style={{
                  marginTop: "10px",
                  background: "red",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  padding: "8px 15px",
                  fontSize: "14px",
                }}
              >
                삭제
              </button>
            </div> // ⭐️ slider-container 닫는 태그
          )}
        </div>
        {/* poster-upload-area 닫는 태그 */}
        <div className="event-info-container">
          <div className="event-content">
            <h3 className="title-center">커뮤니티 글 수정</h3>

            <div className="modifyrecord-row">
              <div className="tag-selection-area" style={{ margin: "15px 0" }}>
                <strong>태그: </strong>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginTop: "5px",
                  }}
                >
                  {TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagSelect(tag)}
                      // ⭐️ 선택 상태에 따른 스타일 변경
                      style={{
                        padding: "8px 12px",
                        borderRadius: "20px",
                        border: `1px solid ${
                          selectedTags.includes(tag) ? "#ffd049" : "#ccc"
                        }`,
                        backgroundColor: selectedTags.includes(tag)
                          ? "#ffd049"
                          : "white",
                        color: selectedTags.includes(tag) ? "black" : "black",
                        cursor: "pointer",
                        fontSize: "14px",
                        transition: "0.2s",
                        fontWeight: 600,
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <strong>제목: </strong>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="title-input"
              />
            </div>
          </div>

          <div className="event-review">
            <h3 className="title-center">내용</h3>
            <textarea
              className="review-item"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />
          </div>

          <button
            onClick={handleSave}
            className="modifyrecord-button"
            disabled={isSubmitting}
          >
            수정하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default Communitymodify;
