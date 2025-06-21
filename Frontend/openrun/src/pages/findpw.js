import React, { useState } from "react";
import "../css/userjoin.css";
import Nav from "../components/nav";
import { useNavigate } from "react-router-dom";

const Findpw = () => {
  const [userId, setUserId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);

  const navigate = useNavigate();

  const handleSendPhoneCode = async () => {
    if (!phoneNumber) {
      alert("휴대폰 번호를 입력해주세요.");
      return;
    }

    try {
      const res = await fetch("/api/auth/verify/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_phonenum: phoneNumber,
          purpose: "find-pw",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("인증번호가 전송되었습니다.");
      } else {
        alert(`전송 실패: ${data.message}`);
      }
    } catch (err) {
      console.error("인증번호 전송 오류:", err);
      alert("인증번호 전송 중 오류가 발생했습니다.");
    }
  };

  // ✅ 인증번호 확인
  const handleVerifyPhoneCode = async () => {
    if (!phoneCode) {
      alert("인증번호를 입력해주세요.");
      return;
    }

    try {
      const res = await fetch("/api/auth/verify/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_phonenum: phoneNumber,
          code: phoneCode,
          purpose: "find-pw",
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert("인증 성공!");
        setPhoneVerified(true);
      } else {
        alert(`인증 실패: ${data.message || "잘못된 인증번호입니다."}`);
        setPhoneVerified(false);
      }
    } catch (err) {
      console.error("인증 확인 오류:", err);
      alert("인증 확인 중 오류가 발생했습니다.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phoneVerified) {
      alert("휴대폰 인증을 완료해주세요.");
      return;
    }

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
        state: { userId: data.user_id },
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
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setPhoneVerified(false); // 번호 바뀌면 재인증
                }}
              />
              <button type="button" id="sendPhoneCode" onClick={handleSendPhoneCode}>
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
                value={phoneCode}
                onChange={(e) => {
                  setPhoneCode(e.target.value);
                  setPhoneVerified(false); // 인증번호 바뀌면 재확인
                }}
              />
              <button type="button" id="verifyPhoneCode" onClick={handleVerifyPhoneCode}>
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
