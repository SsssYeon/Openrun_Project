//api 연결 O

import React, { useState } from "react";
import "../css/userjoin.css";
import Nav from "../components/nav";
import { useLocation, useNavigate } from "react-router-dom";

const Findpwresult = () => {

  const location = useLocation();
  const navigate = useNavigate();
  const { userId } = location.state || {};

  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== passwordCheck) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          new_password: password,
        }),
      });

      if (!res.ok) {
        throw new Error("비밀번호 변경 실패");
      }

      alert("비밀번호가 성공적으로 변경되었습니다!");
      navigate("/login"); // 로그인 페이지로 이동
    } catch (err) {
      console.error(err);
      alert("오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div>
      <div>
        <Nav />
      </div>
      <form onSubmit={handleSubmit}>
        <div>
          <h2 id="userjoin_title"> 비밀번호 변경 </h2>
        </div>
        <div className="userjoin">
          <div>
            {/* 새 비밀번호 */}
            <div>
              <h5> 새 비밀번호 </h5>
              <input
                type="password"
                class="input-field-2"
                maxLength="15"
                name="userjoin_password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                // placeholder="비밀번호"
              />
            </div>

            {/* 새 비밀번호 확인 */}
            <div>
              <h5> 새 비밀번호 확인 </h5>
              <input
                type="password"
                class="input-field-2"
                maxLength="15"
                name="userjoin_pswCheck"
                value={passwordCheck}
                onChange={(e) => setPasswordCheck(e.target.value)}
                // placeholder="비밀번호 확인"
              />
            </div>
          </div>
        </div>

        <div>
          <button type="submit" id="sbtn">
            완료
          </button>
        </div>
      </form>
    </div>
  );
};

export default Findpwresult;