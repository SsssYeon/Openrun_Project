import React from "react";
import "../css/userjoin.css";
import Nav from "../components/nav";

const Findpw = () => {
  return (
    <div>
      <div>
        <Nav />
      </div>
      <form>
        <div>
          <h2 id="userjoin_title"> 비밀번호 찾기 </h2>
        </div>
        <div className="userjoin">
          <div>

            {/* 이름 */}
            {/* 아이디 */}
            <div>
              <h5> 아이디 </h5>
              <input
                type="text"
                class="input-field-2"
                maxLength="20"
                name="userjoin_id"
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