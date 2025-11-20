//api 연결 O, 백엔드 없이 화면 보는데 문제 없음

import React, { useState, useEffect } from "react";
import "../css/userjoin.css";
import Nav from "../components/nav";
import { useNavigate } from "react-router-dom";

import { signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { auth } from "../firebase";

const Findid = () => {
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [foundId, setFoundId] = useState(null);

  const [isSendingCode, setIsSendingCode] = useState(false); // 전송 중 상태 추가

  const [confirmationResult, setConfirmationResult] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // reCAPTCHA가 이미 초기화되었는지 확인
    if (
      typeof window.recaptchaVerifier === "undefined" ||
      !window.recaptchaVerifier
    ) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container-findid", // ID 변경 (페이지별 고유하게 설정)
          {
            size: "invisible",
            callback: (response) => {
              console.log("reCAPTCHA solved for Findid.");
            },
            "expired-callback": () => {
              console.log("reCAPTCHA expired. Resetting for Findid.");
              if (window.recaptchaVerifier && window.recaptchaVerifier.reset) {
                window.recaptchaVerifier.reset();
              }
            },
          }
        );
        window.recaptchaVerifier
          .render()
          .catch((error) => console.error("reCAPTCHA rendering error:", error));
      } catch (error) {
        console.error("Failed to initialize RecaptchaVerifier:", error);
      }
    }
  }, []);

  const handleSendPhoneCode = async () => {
    if (!phoneNumber) {
      alert("휴대폰 번호를 입력해주세요.");
      return;
    }

    if (isSendingCode) return; // 중복 클릭 방지
    setIsSendingCode(true);
    setConfirmationResult(null); // 전송 전에 기존 결과 초기화

    // 전화번호 형식 보정: 010-xxxx-xxxx -> +8210xxxxxxxx
    const cleanedPhoneNumber = phoneNumber.replace(/[^0-9]/g, ""); // 숫자만 남김
    if (cleanedPhoneNumber.length < 10) {
      alert("올바른 휴대폰 번호를 입력해주세요.");
      return;
    }
    const finalPhoneNumber = "+82" + cleanedPhoneNumber.substring(1); // 010 -> +8210

    try {
      const appVerifier = window.recaptchaVerifier;

      if (!appVerifier) {
        alert(
          "인증 시스템 초기화 오류. 페이지를 새로고침하거나 잠시 후 다시 시도해 주세요."
        );
        return;
      }

      // Firebase로 인증번호 전송 시도
      const result = await signInWithPhoneNumber(
        auth,
        finalPhoneNumber,
        appVerifier
      );

      // 확인 결과를 상태에 저장
      setConfirmationResult(result);
      alert("인증번호가 전송되었습니다.");
    } catch (err) {
      console.error("Firebase 인증번호 전송 오류:", err);
      alert(`인증번호 전송 중 오류가 발생했습니다. (오류: ${err.code})`);
      // reCAPTCHA 재설정
      if (window.recaptchaVerifier && window.recaptchaVerifier.reset) {
        window.recaptchaVerifier.reset();
      }
    }
  };

  const handleVerifyPhoneCode = async () => {
    if (!confirmationResult) {
      alert("먼저 인증번호 전송을 완료해주세요.");
      return;
    }

    if (!phoneCode) {
      alert("인증번호를 입력해주세요.");
      return;
    }

    try {
      // 사용자가 입력한 코드로 인증을 시도합니다.
      await confirmationResult.confirm(phoneCode);

      // 인증 성공!
      alert("인증 성공!");
      setPhoneVerified(true);
    } catch (err) {
      console.error("Firebase 인증 확인 오류:", err);
      alert("인증 실패: 잘못된 인증번호이거나 만료되었습니다.");
      setPhoneVerified(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phoneVerified) {
      alert("휴대폰 인증을 완료해주세요.");
      return;
    }

    try {
      const res = await fetch("/api/auth/find-id", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_nm: userName,
          user_phonenum: phoneNumber.replace(/[^0-9]/g, ""),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "사용자 정보를 찾을 수 없습니다.");
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
      <div className="findid-container">
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
                  placeholder="010xxxxxxxx"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <button
                  type="button"
                  id="sendPhoneCode"
                  onClick={handleSendPhoneCode}
                >
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
                    setPhoneVerified(false); // ✅ 인증 다시 필요
                  }}
                />
                <button
                  type="button"
                  id="verifyPhoneCode"
                  onClick={handleVerifyPhoneCode}
                >
                  인증 확인
                </button>
              </div>
            </div>
          </div>

          <div
            id="recaptcha-container-findid"
            style={{ visibility: "hidden", height: 0 }}
          />

          <div>
            <button type="submit" id="sbtn">
              확인
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Findid;
