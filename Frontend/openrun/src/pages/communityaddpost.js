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
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const navigate = useNavigate();

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const fileInputRef = useRef(null); 

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      setPosterFiles((prevFiles) => [...prevFiles, ...Array.from(files)]);

      const newPreviews = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setPosterPreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);

      setCurrentImageIndex(0);
    }
    e.target.value = null;
  };

  const handleImageRemove = (e, indexToRemove) => {
    e.stopPropagation(); 

    const newFiles = posterFiles.filter((_, i) => i !== indexToRemove);
    const newPreviews = posterPreviews.filter((_, i) => i !== indexToRemove);

    setPosterFiles(newFiles);
    setPosterPreviews(newPreviews);

    setCurrentImageIndex((prevIndex) => {
      const newLength = newPreviews.length;
      if (newLength === 0) return 0; 

      if (prevIndex > indexToRemove) {
        return prevIndex - 1;
      }
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

  const TAGS = ["시야", "공연 후기", "공연 정보", "사담"]; // 태그 목록 정의

  const handleTagSelect = (tag) => {
    setSelectedTags((prevTags) => {
      if (prevTags.includes(tag)) {
        return prevTags.filter((t) => t !== tag);
      } else {
        return [...prevTags, tag];
      }
    });
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      console.error("제목 또는 내용이 비어 있습니다.");
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

    selectedTags.forEach((tag) => {
      formData.append("postTag", tag);
    });
    posterFiles.forEach((file) => {
      formData.append("postImage[]", file);
    });

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      const res = await fetch(`/api/community/posts`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }), 
        },
        body: formData,
      });

      if (res.ok) {
        alert("글이 성공적으로 작성되었습니다.");
        navigate("/community");
      } else {
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
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
            multiple
          />
          {posterPreviews.length === 0 && (
            <img
              src="/default-poster.png"
              alt="포스터 추가 (클릭)"
              className="add-post-poster"
              onClick={handleImageClick}
            />
          )}
          {posterPreviews.length > 0 && (
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
                  position: "relative", 
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
              {/* 삭제 버튼 (현재 이미지 위에 오버레이) */}
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
            </div> 
          )}
        </div>

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
