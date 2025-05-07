import React from "react";
import "../css/userjoin.css";
import Nav from "../components/nav";

const Findpwresult = () => {
  return (
    <div>
      <div>
        <Nav />
      </div>
      <form>
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
