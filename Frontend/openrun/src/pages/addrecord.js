//api 연결 O, 백엔드 없이 화면 보는데 문제 없음

import React, { useRef, useState } from "react";
import Nav from "../components/nav";
import "../css/eventdetail.css";
import performances from "../mocks/performances"; // 공연 정보 데이터

const Addrecord = () => {
  const [name, setName] = useState("");
  const [poster, setPoster] = useState("/default-poster.png");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [seat, setSeat] = useState("");
  const [cast, setCast] = useState("");
  const [cost, setCost] = useState("");
  const [memo, setMemo] = useState("");
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState("/default-poster.png");

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setName(title); // 또는 setSelectedTitle(title)

    const found = performances.find((p) => p.api_prfnm === title);
    if (found) {
      setPoster(found.api_poster); // 해당 공연 포스터로 변경
    } else {
      setPoster("/default-poster.png"); // 찾을 수 없으면 기본 이미지
    }
  };

  const fileInputRef = useRef(null); // input 참조

  const handleImageClick = () => {
    fileInputRef.current.click(); // 이미지 클릭 시 input 열기
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPosterFile(file);
      setPosterPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!name || !date || !location || !cast) {
      alert("공연명, 날짜, 장소, 출연진은 필수 입력입니다.");
      return;
    }

    const formData = new FormData();
    formData.append("pfmcalender_nm", name);
    formData.append("pfmcalender_date", date);
    formData.append("pfmcalender_time", time);
    formData.append("pfmcalender_location", location);
    formData.append("pfmcalender_seat", seat);
    formData.append("pfmcalender_today_cast", cast);
    formData.append("pfmcalender_cost", cost);
    formData.append("pfmcalender_memo", memo);

    if (posterFile) {
      formData.append("pfmcalender_poster", posterFile); // 실제 이미지 파일 추가
    }

    try {
      const res = await fetch("/api/calendar/me", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("기록이 저장되었습니다.");
      } else {
        alert("기록 저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("저장 요청 실패:", error);
    }
  };

  return (
    <div>
      <Nav />
      <div className="event-detail">
        <img
          src={posterPreview}
          alt="포스터 미리보기"
          className="poster"
          onClick={handleImageClick}
          style={{ cursor: "pointer" }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/default-poster.png";
          }}
        />
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <div className="event-info-container">
          <div className="event-content">
            <h3 className="title-center">관람기록 추가</h3>

            <div className="modifyrecord-row">
              <strong>공연명: </strong>
              <input
                value={name}
                onChange={handleTitleChange}
                list="performance-list"
              />
              <datalist id="performance-list">
                {performances.map((p) => (
                  <option key={p.api_mt20id} value={p.api_prfnm} />
                ))}
              </datalist>
            </div>

            <div className="modifyrecord-row">
              <strong>날짜: </strong>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="modifyrecord-row">
              <strong>시간: </strong>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            <div className="modifyrecord-row">
              <strong>장소: </strong>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="modifyrecord-row">
              <strong>좌석: </strong>
              <input value={seat} onChange={(e) => setSeat(e.target.value)} />
            </div>

            <div className="modifyrecord-row">
              <strong>출연진: </strong>
              <input value={cast} onChange={(e) => setCast(e.target.value)} />
            </div>

            <div className="modifyrecord-row">
              <strong>가격: </strong>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </div>
          </div>

          <div className="event-review">
            <h3 className="title-center">관람 후기</h3>
            <textarea
              className="review-item"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={6}
            />
          </div>

          <button onClick={handleSave} className="modifyrecord-button">
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default Addrecord;
