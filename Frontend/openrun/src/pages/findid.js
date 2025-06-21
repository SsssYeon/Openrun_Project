import React, { useState, useEffect } from "react";
import "../css/userjoin.css";
import Nav from "../components/nav";
import { useNavigate } from "react-router-dom";

const Findid = () => {
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [foundId, setFoundId] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/auth/find-id", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_nm: userName,
          user_phonenum: phoneNumber,
        }),
      });

      if (!res.ok) {
        throw new Error("사용자 정보를 찾을 수 없습니다.");
      }

      const data = await res.json();
      setFoundId(data.user_id);
    } catch (err) {
      console.error(err);
      alert("일치하는 회원 정보를 찾을 수 없습니다.");
      setFoundId(null);
    }
  };

  useEffect(() => {
    if (foundId) {
      navigate("/findidresult", { state: { userId: foundId } });
    }
  }, [foundId, navigate]);

  return (
    <div>
      <div>
        <Nav />
      </div>
      <form onSubmit={handleSubmit}>
        <div>
          <h2 id="userjoin_title"> 아이디 찾기 </h2>
        </div>
        <div className="userjoin">
          <div>
            {/* 이름 */}
            <div>
              <h5> 이름 </h5>
              <input
                type="text"
                class="input-field-2"
                maxLength="10"
                name="userjoin_name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                // placeholder="이름"
              />
            </div>

            {/* 휴대폰 번호 */}
            <div>
              <h5> 휴대폰 번호 </h5>
              <input
                type="text"
                class="input-field-1"
                maxLength="11"
                name="userjoin_tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <button type="button" id="sendPhoneCode">
                인증번호 전송
              </button>
              {/*인증번호 전송, 백엔드 개발과 함께 수정 예정*/}
            </div>

            {/* 인증번호 */}
            <div>
              <h5> 인증번호 </h5>
              <input
                type="text"
                class="input-field-1"
                maxLength="6"
                name="userjoin_phonecode"
              />
              <button type="button" id="verifyPhoneCode">
                인증 확인
              </button>
            </div>
          </div>
        </div>

        <div>
          <button type="submit" id="sbtn">
            확인
          </button>
        </div>
      </form>
    </div>
  );
};

export default Findid;
