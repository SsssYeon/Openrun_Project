// 홈화면

import React from "react";
import ReactFullpage from "@fullpage/react-fullpage";
import Main from "./main.js";
import Main2 from "./main2.js";

const Home = () => (
  <ReactFullpage
    licenseKey={"YOUR_LICENSE_KEY"} 
    scrollingSpeed={1000} 
    navigation={true} 
    sectionsColor={["#f0f0f0", "#ffffff"]} 
    anchors={["first", "second"]} 
    
    normalScrollElements={'.main-search-container'}
    scrollOverflow={true}
    
    render={() => (
      <div>
        <div className="section main-section">
          <Main />
        </div>

        <div className="section">
          <Main2 />
        </div>
      </div>
    )}
  />
);

export default Home;
