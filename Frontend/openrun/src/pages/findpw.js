import React, { useState } from "react";
import "../css/userjoin.css";
import Nav from "../components/nav";
import { useNavigate } from "react-router-dom";

const Findpw = () => {

  const [userId, setUserId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/find-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          user_phonenum: phoneNumber,
        }),
      });

      if (!res.ok) {
        throw new Error("정보가 일치하지 않습니다.");
      }

      const data = await res.json();

      // 성공 시 다음 페이지로 이동 (예: 비밀번호 재설정)
      navigate("/findpwresult", {
        state: { userId: data.user_id  },
      });
    } catch (err) {
      console.error(err);
      alert("아이디와 전화번호를 확인해주세요.");
    }
  };

  return (
    <div>
      <div>
        <Nav />
      </div>
      <form onSubmit={handleSubmit}>
        <div>
          <h2 id="userjoin_title"> 비밀번호 찾기 </h2>
        </div>
        <div className="userjoin">
          <div>
            {/* 아이디 */}
            <div>
              <h5> 아이디 </h5>
              <input
                type="text"
                class="input-field-2"
                maxLength="20"
                name="userjoin_id"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                // placeholder="7자 이상의 문자"
                autoFocus
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

export default Findpw;