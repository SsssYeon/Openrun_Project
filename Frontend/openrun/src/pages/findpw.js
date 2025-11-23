// 비밀번호 찾기 화면, api 연결 완료

import React, { useState, useEffect } from "react";
import "../css/userjoin.css";
import Nav from "../components/nav";
import { useNavigate } from "react-router-dom";

import { signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { auth } from "../firebase"; 

const Findpw = () => {
  const [userId, setUserId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);

  const [confirmationResult, setConfirmationResult] = useState(null);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

  const [isSendingCode, setIsSendingCode] = useState(false); 

  const navigate = useNavigate();

  useEffect(() => {
    if (
      typeof window.recaptchaVerifier === "undefined" ||
      !window.recaptchaVerifier
    ) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container-findpw", 
          {
            size: "invisible",
            callback: (response) => {
              console.log("reCAPTCHA solved for Findpw.");
            },
            "expired-callback": () => {
              console.log("reCAPTCHA expired. Resetting for Findpw.");
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

    if (isSendingCode) return; 
    setIsSendingCode(true);
    setConfirmationResult(null);

    const cleanedPhoneNumber = phoneNumber.replace(/[^0-9]/g, "");
    if (cleanedPhoneNumber.length < 10) {
      alert("올바른 휴대폰 번호를 입력해주세요.");
      return;
    }
    const finalPhoneNumber = "+82" + cleanedPhoneNumber.substring(1); 

    
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

  // 인증번호 확인
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
      await confirmationResult.confirm(phoneCode);

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
      const res = await fetch("/api/auth/find-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          user_phonenum: phoneNumber.replace(/[^0-9]/g, ""),
        }),
      });

      if (!res.ok) {
        throw new Error("정보가 일치하지 않습니다.");
      }

      const data = await res.json();

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
      <div className="findid-container">
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
                  placeholder="010xxxxxxxx"
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    setPhoneVerified(false); 
                  }}
                />
                <button
                  type="button"
                  id="sendPhoneCode"
                  onClick={handleSendPhoneCode}
                >
                  인증번호 전송
                </button>
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
                    setPhoneVerified(false); 
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
            id="recaptcha-container-findpw"
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

export default Findpw;
