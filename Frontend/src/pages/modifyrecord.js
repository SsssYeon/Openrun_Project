
import { useParams, useNavigate } from "react-router-dom";
import Nav from "../components/nav";
// import events from "../mocks/events"; // 경로는 실제 파일 위치에 맞게 조정
import "../css/eventdetail.css";
import React, { useState, useEffect, useRef } from "react";



const Modifyrecord = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [seat, setSeat] = useState("");
  const [cast, setCast] = useState("");
  const [cost, setCost] = useState("");
  const [memo, setMemo] = useState("");
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState("/default-poster.png");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const setFormFields = (data) => {
    setEvent(data);
    setName(data.pfmcalender_nm || "");
    setDate(data.pfmcalender_date || "");
    setTime(data.pfmcalender_time || "");
    setLocation(data.pfmcalender_location || "");
    setSeat(data.pfmcalender_seat || "");
    setCast(data.pfmcalender_today_cast || "");
    setCost(data.pfmcalender_cost || "");
    setMemo(data.pfmcalender_memo || "");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/calendar/me/${id}`);
        if (!res.ok) throw new Error("데이터를 불러올 수 없습니다.");
        const data = await res.json();

        setEvent(data);
        setName(data.pfmcalender_nm || "");
        setDate(data.pfmcalender_date || "");
        setTime(data.pfmcalender_time || "");
        setLocation(data.pfmcalender_location || "");
        setSeat(data.pfmcalender_seat || "");
        setCast(data.pfmcalender_today_cast || "");
        setCost(data.pfmcalender_cost || "");
        setMemo(data.pfmcalender_memo || "");

        setPosterPreview(data.pfmcalender_poster || "/default-poster.png");
      } catch (error) {
        console.error(error);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  // 이미지 파일 선택 시
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPosterFile(file);
      setPosterPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!name || !date) {
      alert("공연명, 날짜는 필수 입력입니다.");
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
      formData.append("pfmcalender_poster", posterFile);
    }

    try {
      const res = await fetch(`/api/calendar/me/${id}`, {
        method: "PATCH", // PUT 대신 PATCH로 변경
        body: formData,
      });

      if (res.ok) {
        alert("수정이 완료되었습니다.");
        navigate("/calendarrecords");
        // navigate("/"); 등으로 이동 가능
      } else {
        alert("수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("수정 요청 실패:", error);
    }
  };

  if (loading) return <div>불러오는 중...</div>;
  if (!event) return <div>해당 관극 기록을 찾을 수 없습니다.</div>;

  return (
    <div>
      <div>
        <Nav />
      </div>
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
            <h3 className="title-center">{event.pfmcalender_nm}</h3>
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

export default Modifyrecord;
