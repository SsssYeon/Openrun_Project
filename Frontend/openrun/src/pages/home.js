import React from 'react';
import ReactFullpage from '@fullpage/react-fullpage';
import Main from './main.js';
import Main2 from './main2.js';


const Home = () => (
<ReactFullpage
      licenseKey={'YOUR_LICENSE_KEY'}  // (필요시) 라이센스 키 입력
      scrollingSpeed={700}  // 섹션 간 스크롤 속도 (밀리초 단위)
      navigation={true}  // 네비게이션 추가 (섹션 번호 표시)
      sectionsColor={['#f0f0f0', '#ffffff']}  // 각 섹션 배경색 설정
      anchors={['first', 'second']}  // 각 섹션에 대한 앵커 설정
      render={() => (
        <div>
          {/* 첫 번째 섹션 (Main 컴포넌트) */}
          <div className="section" >
            <Main />
          </div>
          
          {/* 두 번째 섹션 (Main2 컴포넌트) */}
          <div className="section">
            <Main2 />
          </div>
        </div>
      )}
    />
);

export default Home;