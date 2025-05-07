import React from "react";
import "../css/userjoin.css";
import Nav from "../components/nav";

const Userjoin = () => {
  return (
    <div>
      <div>
        <Nav />
      </div>
      <form>
        <div>
          <h2 id="userjoin_title"> 회원가입</h2>
        </div>
        <div className="userjoin">
          <div>
            {/* 아이디 */}
            <div>
              <h5> 아이디 </h5>
              <input
                type="text"
                class="input-field-1"
                maxLength="20"
                name="userjoin_id"
                placeholder="7자 이상의 문자"
                autoFocus
              />
              <button type="button" id="dupIdCheck">
                중복확인
              </button>
            </div>

            {/* 비밀번호 */}
            <div>
              <h5> 비밀번호 </h5>
              <input
                type="password"
                class="input-field-2"
                maxLength="15"
                name="userjoin_password"
                // placeholder="비밀번호"
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <h5> 비밀번호 확인 </h5>
              <input
                type="password"
                class="input-field-2"
                maxLength="15"
                name="userjoin_pswCheck"
                // placeholder="비밀번호 확인"
              />
            </div>

            {/* 이름 */}
            <div>
              <h5> 이름 </h5>
              <input
                type="text"
                class="input-field-2"
                maxLength="10"
                name="userjoin_name"
                // placeholder="이름"
              />
            </div>

            {/* 닉네임 */}
            <div>
              <h5> 닉네임 </h5>
              <input
                type="text"
                class="input-field-2"
                maxLength="10"
                name="userjoin_nickname"
                // placeholder="닉네임"
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
            가입완료
          </button>
        </div>
      </form>
    </div>
  );
};

export default Userjoin;
