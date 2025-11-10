// 오픈런 랭킹, 오픈런 추천 공연 api 연결 완료 / 추후 커뮤니티 및 배너 수정 예정

import { useParams, useNavigate } from "react-router-dom";
import Nav from "../components/nav";
import events from "../mocks/events"; // 경로는 실제 파일 위치에 맞게 조정
import "../css/eventdetail.css";
import React, { useState, useEffect } from "react";

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
  const [bookingsite, setBookingsite] = useState("");
  const [memo, setMemo] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const fetchEventDetail = async () => {
      try {
        const res = await fetch(`/api/calendar/me/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (!res.ok) throw new Error("API 응답 오류");
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
        setBookingsite(data.pfmcalender_bookingsite || "");
      } catch (error) {
        console.warn("API 불러오기 실패, mocks 데이터로 대체:", error);
        const found = events.find(
          (item) => String(item.pfmcalender_doc_no) === id
        );
        if (found) {
          setEvent(found);
          setName(found.pfmcalender_nm || "");
          setDate(found.pfmcalender_date || "");
          setTime(found.pfmcalender_time || "");
          setLocation(found.pfmcalender_location || "");
          setSeat(found.pfmcalender_seat || "");
          setCast(found.pfmcalender_today_cast || "");
          setCost(found.pfmcalender_cost || "");
          setMemo(found.pfmcalender_memo || "");
          setBookingsite(found.pfmcalender_bookingsite || "");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetail();
  }, [id]);

  const handleSave = async () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    const updatedRecord = {
      pfmcalender_nm: name,
      pfmcalender_date: date,
      pfmcalender_time: time,
      pfmcalender_location: location,
      pfmcalender_seat: seat,
      pfmcalender_today_cast: cast,
      pfmcalender_cost: Number(cost),
      pfmcalender_memo: memo,
      pfmcalender_bookingsite: bookingsite,
    };

    try {
      const res = await fetch(`/api/calendar/me/${id}`, {
        method: "PUT", // 또는 PATCH
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }), // 토큰이 있을 때만 헤더에 추가
        },
        body: JSON.stringify(updatedRecord),
      });

      if (res.ok) {
        alert("수정이 완료되었습니다.");
        navigate(`/detail/${id}`);
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
        {/* <img
          src={"/default-poster.png"} // 포스터 정보가 없다면 기본 이미지 사용
          alt={`${event.pfmcalender_nm} 포스터`}
          className="poster"
        /> */}
        <img
          src={event.pfmcalender_poster || "/default-poster.png"}
          alt={`${event.pfmcalender_nm} 포스터`}
          className="poster"
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
            <div className="modifyrecord-row">
              <strong>예매처: </strong>
              <input
                value={bookingsite}
                onChange={(e) => setBookingsite(e.target.value)}
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
