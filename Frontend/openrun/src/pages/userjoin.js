//api 연결 O, 백엔드 없이 화면 보는데 문제 없음

import React, { useState } from "react";
import "../css/userjoin.css";
import Nav from "../components/nav";
import { NavLink, useNavigate } from "react-router-dom";

const Userjoin = () => {
  const navigate = useNavigate(); // 로그인 성공 후 페이지 이동용
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "user_id") setIdChecked(false);
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

  // ✅ 인증번호 전송
  const handleSendPhoneCode = async () => {
    if (!formData.user_phonenum) {
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
          user_phonenum: formData.user_phonenum,
          purpose: "signup",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("인증번호가 전송되었습니다.");
      } else {
        alert(`전송 실패: ${data.message}`);
      }
    } catch (err) {
      console.error("전송 오류:", err);
      alert("인증번호 전송 중 오류가 발생했습니다.");
    }
  };

  // ✅ 인증번호 확인
  const handleVerifyPhoneCode = async () => {
    if (!formData.user_phonecode) {
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
          user_phonenum: formData.user_phonenum,
          code: formData.user_phonecode,
          purpose: "signup",
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
          // user_doc_no, user_local_token, user_kakao_token, user_timestamp는 가입 시점엔 백엔드에서 자동 생성 가능
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
            >
              중복확인
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
            />
            <button
              type="button"
              id="sendPhoneCode"
              onClick={handleSendPhoneCode}
            >
              인증번호 전송
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
