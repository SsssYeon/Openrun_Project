// 회원가입 화면

import React, { useState, useEffect } from "react";
import "../css/userjoin.css";
import Nav from "../components/nav";
import { NavLink, useNavigate } from "react-router-dom";

import { signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { auth } from "../firebase"; 

const Userjoin = () => {
  const navigate = useNavigate(); 
  const [formData, setFormData] = useState({
    user_id: "",
    user_pw: "",
    user_pw_check: "",
    user_nm: "",
    user_nicknm: "",
    user_phonenum: "",
    user_phonecode: "",
  });

  const [idChecked, setIdChecked] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  const [confirmationResult, setConfirmationResult] = useState(null);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

  useEffect(() => {
    if (
      typeof window.recaptchaVerifier === "undefined" ||
      !window.recaptchaVerifier
    ) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          {
            size: "invisible",
            callback: (response) => {
              console.log("reCAPTCHA solved.");
            },
            "expired-callback": () => {
              console.log("reCAPTCHA expired. Resetting.");
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "user_id") setIdChecked(false);

    if (name === "user_phonenum") {
      setPhoneVerified(false);
      setConfirmationResult(null);
      setFormData((prev) => ({ ...prev, user_phonecode: "" }));
    }
  };

  const handleCheckDuplicateId = async () => {
    if (!formData.user_id) {
      alert("아이디를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(
        `/api/auth/check-id?user_id=${formData.user_id}`
      );
      const data = await response.json();

      if (response.ok) {
        if (data.exists) {
          alert("이미 사용 중인 아이디입니다.");
          setIdChecked(false);
        } else {
          alert("사용 가능한 아이디입니다.");
          setIdChecked(true);
        }
      } else {
        alert("중복 확인 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("중복 확인 에러:", error);
      alert("서버 연결 오류가 발생했습니다.");
    }
  };

  const handleSendPhoneCode = async () => {
    if (!formData.user_phonenum) {
      alert("휴대폰 번호를 입력해주세요.");
      return;
    }

    try {
      const appVerifier = window.recaptchaVerifier;

      if (!appVerifier) {
        alert(
          "인증 시스템 초기화 오류. 페이지를 새로고침하거나 잠시 후 다시 시도해 주세요."
        );
        return;
      }

      const phoneNumber =
        "+82" + formData.user_phonenum.replace(/-/g, "").substring(1);

      const result = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        appVerifier
      );

      setConfirmationResult(result);
      alert("인증번호가 전송되었습니다.");
    } catch (err) {
      console.error("Firebase 인증번호 전송 오류:", err);
      alert(`인증번호 전송 중 오류가 발생했습니다. (오류: ${err.code})`);
    }
  };

  const handleVerifyPhoneCode = async () => {
    if (!confirmationResult) {
      alert("먼저 인증번호 전송을 완료해주세요.");
      return;
    }

    if (!formData.user_phonecode) {
      alert("인증번호를 입력해주세요.");
      return;
    }

    try {
      await confirmationResult.confirm(formData.user_phonecode);
      alert("인증 성공!");
      setPhoneVerified(true);
    } catch (err) {
      console.error("Firebase 인증 확인 오류:", err);
      alert("인증 실패: 잘못된 인증번호이거나 만료되었습니다.");
      setPhoneVerified(false);
    }
  };

  const isValidPassword = (pw, userId) => {
    const regex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    return regex.test(pw) && !pw.includes(userId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!idChecked) {
      alert("아이디 중복확인을 해주세요.");
      return;
    }

    if (!phoneVerified) {
      alert("휴대폰 인증을 완료해주세요.");
      return;
    }

    if (!isValidPassword(formData.user_pw, formData.user_id)) {
      alert(
        "비밀번호는 영문, 숫자, 특수기호 포함 8자 이상이며, 아이디와 동일할 수 없습니다."
      );
      return;
    }

    if (formData.user_pw !== formData.user_pw_check) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: formData.user_id,
          user_pw: formData.user_pw,
          user_nm: formData.user_nm,
          user_nicknm: formData.user_nicknm,
          user_phonenum: formData.user_phonenum,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("회원가입 성공!");
        navigate("/login");
      } else {
        alert(`회원가입 실패: ${data.message}`);
      }
    } catch (error) {
      alert("회원가입 중 오류 발생");
      console.error(error);
    }
  };

  return (
    <div>
      <Nav />
      <div className="userjoin-container">
        <form onSubmit={handleSubmit}>
          <h2 id="userjoin_title">회원가입</h2>
          <div className="userjoin">
            {/* 아이디 */}
            <div>
              <h5>아이디</h5>
              <input
                type="text"
                className="input-field-1"
                name="user_id"
                value={formData.user_id}
                onChange={handleChange}
                placeholder="7자 이상의 문자"
                maxLength="20"
                autoFocus
              />
              <button
                type="button"
                id="dupIdCheck"
                onClick={handleCheckDuplicateId}
                style={{
                  backgroundColor: "#ffd049", 
                  color: "black", 
                }}
                disabled={idChecked}
              >
                {idChecked ? "확인완료" : "중복확인"}
              </button>
            </div>

            {/* 비밀번호 */}
            <div>
              <h5>비밀번호</h5>
              <input
                type="password"
                className="input-field-2"
                name="user_pw"
                value={formData.user_pw}
                onChange={handleChange}
                maxLength="15"
              />
              <p
                className="pw-requirements"
                style={{ fontSize: "0.85rem", color: "#888", marginTop: "4px" }}
              >
                - 영문, 숫자, 특수기호 포함 8자 이상 / 아이디 불가
              </p>
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <h5>비밀번호 확인</h5>
              <input
                type="password"
                className="input-field-2"
                name="user_pw_check"
                value={formData.user_pw_check}
                onChange={handleChange}
                maxLength="15"
              />
            </div>

            {/* 이름 */}
            <div>
              <h5>이름</h5>
              <input
                type="text"
                className="input-field-2"
                name="user_nm"
                value={formData.user_nm}
                onChange={handleChange}
                maxLength="10"
              />
            </div>

            {/* 닉네임 */}
            <div>
              <h5>닉네임</h5>
              <input
                type="text"
                className="input-field-2"
                name="user_nicknm"
                value={formData.user_nicknm}
                onChange={handleChange}
                maxLength="10"
              />
            </div>

            {/* 휴대폰 번호 */}
            <div>
              <h5>휴대폰 번호</h5>
              <input
                type="text"
                className="input-field-1"
                name="user_phonenum"
                value={formData.user_phonenum}
                onChange={handleChange}
                maxLength="13"
                placeholder="010-xxxx-xxxx"
                disabled={phoneVerified}
              />
              <button
                type="button"
                id="sendPhoneCode"
                onClick={handleSendPhoneCode}
                disabled={phoneVerified}
              >
                {phoneVerified ? "전송 완료" : "인증번호 전송"}
              </button>{" "}
            </div>

            <div>
              <h5>인증번호</h5>
              <input
                type="text"
                className="input-field-1"
                name="user_phonecode"
                value={formData.user_phonecode}
                onChange={handleChange}
                maxLength="6"
                disabled={phoneVerified || !confirmationResult}
              />
              <button
                type="button"
                id="verifyPhoneCode"
                onClick={handleVerifyPhoneCode}
                style={{
                  backgroundColor: "#ffd049",
                  color: "black",
                }}
                disabled={phoneVerified}
              >
                {phoneVerified ? "인증 완료" : "인증 확인"}
              </button>
            </div>

            <div
              id="recaptcha-container"
              style={{ visibility: "hidden", height: 0 }}
            />
          </div>
          <div>
            <button type="submit" id="sbtn">
              가입완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Userjoin;
