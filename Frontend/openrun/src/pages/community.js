// 닉네임 불러오는 것만 api 연결 완료, api 연결 안됐을 때 mocks 데이터 사용 (오픈런 고인물)

import React from "react";
import Nav from "../components/nav";
import "../css/community.css";

const Community = () => {
  return (
    <div>
      <Nav />
      <div className="community">
        <p className="community-notice">
          추후 커뮤니티가 될 페이지입니다! 많은 의견 부탁드립니다 ( _ _ )
        </p>
      </div>
    </div>
  );
};

export default Community;
