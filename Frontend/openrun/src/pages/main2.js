import React, {useEffect, useState } from "react";
import "../css/main.css"; // CSS 파일 연결
// import rankData from "../mocks/rank.json";

const Main2 = () => {
    // const [showList, setShowList] = useState([]);

    // useEffect(() => {
    //   // mockData.json 데이터를 상태에 설정
    //   setShowList(rankData);
    // }, []);

  return (
    <div className="layout">
      <div className="left">
        <h3 id="title">오픈런 랭킹</h3>
        {/* <ul>
        {showList.map((show) => (
            <li key={show.id}>
              <img src={show.posterUrl} alt={show.title} />
              <p>{show.rank}위</p>
              <h4>{show.title}</h4>
            </li>
          ))}
        </ul> */}
      </div>
      

      <div className="right-top">
        <h3 id="title">오픈런 추천 공연</h3>
      </div>

      <div className="right-bottom">
        <h3 id="title">최근 커뮤니티 글</h3>
      </div>

      <div className="banner">
        <h3 id="title">배너가 들어갈 공간입니다!</h3>
      </div>
    </div>
  );
};

export default Main2;
