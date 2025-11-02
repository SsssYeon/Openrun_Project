// 커뮤니티 글 작성, api 연결 완료

import React, { useRef, useState } from "react";
import Nav from "../components/nav";
import "../css/eventdetail.css";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_BASE;

const Communityaddpost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [posterFiles, setPosterFiles] = useState([]);
  const [posterPreviews, setPosterPreviews] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // 중복 제출 방지 상태 추가

  const navigate = useNavigate();

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const fileInputRef = useRef(null); // input 참조

  const handleImageClick = () => {
    fileInputRef.current.click(); // 이미지 클릭 시 input 열기
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      setPosterFiles((prevFiles) => [...prevFiles, ...Array.from(files)]);

      const newPreviews = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setPosterPreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);

      // 새 이미지를 추가했으므로, 인덱스를 0으로 리셋 (새로 추가한 이미지를 바로 보여줄 필요는 없으므로 현 인덱스 유지도 가능)
      // 여기서는 일반적으로 슬라이드를 첫 이미지로 리셋합니다.
      setCurrentImageIndex(0);
    }
    e.target.value = null;
  };

  const handleImageRemove = (e, indexToRemove) => {
    e.stopPropagation(); // 버튼 클릭이 파일 입력창을 열지 않도록 방지

    // 새 배열 생성
    const newFiles = posterFiles.filter((_, i) => i !== indexToRemove);
    const newPreviews = posterPreviews.filter((_, i) => i !== indexToRemove);

    setPosterFiles(newFiles);
    setPosterPreviews(newPreviews);

    // 인덱스 조정
    setCurrentImageIndex((prevIndex) => {
      const newLength = newPreviews.length;
      if (newLength === 0) return 0; // 남은 이미지가 없으면 0

      // 현재 인덱스가 삭제된 인덱스보다 크거나 같다면 (배열이 당겨졌으므로) 인덱스를 하나 줄임
      if (prevIndex > indexToRemove) {
        return prevIndex - 1;
      }
      // 현재 인덱스가 유효한 범위를 벗어난 경우 (e.g. 마지막 이미지 삭제 시)
      if (prevIndex >= newLength) {
        return newLength - 1;
      }

      return prevIndex;
    });
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(
      (prevIndex) =>
        (prevIndex - 1 + posterPreviews.length) % posterPreviews.length
    );
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(
      (prevIndex) => (prevIndex + 1) % posterPreviews.length
    );
  };

  const TAGS = ["시야", "공연 후기", "공연 정보", "사담"]; // ⭐️ 태그 목록 정의

  // ⭐️ [추가] 태그 선택 핸들러
  const handleTagSelect = (tag) => {
    setSelectedTags((prevTags) => {
      if (prevTags.includes(tag)) {
        // 이미 선택된 태그면 배열에서 제거
        return prevTags.filter((t) => t !== tag);
      } else {
        // 선택되지 않은 태그면 배열에 추가
        return [...prevTags, tag];
      }
    });
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      console.error("제목 또는 내용이 비어 있습니다.");
      // alert() 대신 사용자 정의 모달 UI를 사용해야 하지만, 현재는 console.error로 대체합니다.
      alert("제목, 내용은 필수 입력입니다.");
      return;
    }

    if (isSubmitting) {
      console.log("이미 제출 중입니다.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("postTitle", title);
    formData.append("postContent", content);

    // 선택된 태그를 FormData에 추가합니다. (백엔드에서 배열로 처리하도록 요청)
    selectedTags.forEach((tag) => {
      // 일반적으로 백엔드에서 postTag를 배열로 받으려면 이렇게 키를 여러 번 사용합니다.
      formData.append("postTag", tag);
    });
    // 이미지 파일을 FormData에 추가합니다. (postImage라는 키로 여러 파일 추가)
    posterFiles.forEach((file) => {
      formData.append("postImage", file);
    });

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      // ⚠️ API_BASE_URL과 커뮤니티 POST 엔드포인트 사용
      const res = await fetch(`/api/community/posts`, {
        method: "POST",
        headers: {
          // FormData를 사용할 때는 Content-Type을 명시하지 않습니다.
          ...(token && { Authorization: `Bearer ${token}` }), // 토큰은 선택 사항이 아닐 확률이 높습니다.
        },
        body: formData,
      });

      if (res.ok) {
        alert("글이 성공적으로 작성되었습니다.");
        // 성공 후 커뮤니티 메인 페이지 또는 해당 글 상세 페이지로 이동
        navigate("/community");
      } else {
        // 서버 응답 본문을 읽어 에러 메시지를 콘솔에 출력 (디버깅 용)
        const errorText = await res.text();
        console.error("서버 응답 오류:", res.status, errorText);
        alert(`글 작성에 실패했습니다. 상태: ${res.status}`);
      }
    } catch (error) {
      console.error("저장 요청 실패:", error);
      alert("글 작성 중 네트워크 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
              className="add-post-poster"
              onClick={handleImageClick}
            />
          )}
          {/* 2. 이미지가 1개 이상일 때: 슬라이더/단일 뷰 */}
          {posterPreviews.length > 0 && (
            // Slider Container (relative position for absolute buttons)
            <div
              className="slider-container"
              style={{
                flexDirection: "column",
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
            <h3 className="title-center">커뮤니티 글 작성</h3>

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
                          selectedTags.includes(tag) ? "#ccc" : "#ccc"
                        }`,
                        backgroundColor: selectedTags.includes(tag)
                          ? "#ffd049"
                          : "white",
                        color: selectedTags.includes(tag) ? "black" : "black",
                        cursor: "pointer",
                        fontSize: "14px",
                        transition: "0.2s",
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <strong>제목: </strong>
              <input value={title} onChange={handleTitleChange} />
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
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default Communityaddpost;
