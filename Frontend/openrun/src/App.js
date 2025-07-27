import React from "react";
import { Routes, Route } from "react-router-dom";

import Login from "./pages/login";
import Nav from "./components/nav";
import Userjoin from "./pages/userjoin";
import Findid from "./pages/findid";
import Findpw from "./pages/findpw";
import Findpwresult from "./pages/findpwresult";
import Findidresult from "./pages/findidresult";
import Main from "./pages/main";
import Main2 from "./pages/main2";
import Home from "./pages/home";
import Calendarrecords from "./pages/calendarrecords";
import Eventdetail from "./pages/eventdetail";
import Mypage from "./pages/mypage";
import Account from "./pages/account";
import Passwordchange from "./pages/passwordchange";
import Myposts from "./pages/myposts";
import Favorites from "./pages/favorites";
import Performancedetail from "./pages/performancedetail";
import Addrecord from "./pages/addrecord";
import Modifyrecord from "./pages/modifyrecord";
import Mylikescalendar from "./pages/mylikescalendar";
import Myreport from "./pages/myreport";
import PrivateRoute from "./components/privateroute";
import Community from "./pages/community";

// import Counter from"./pages/counter";
// import Input from"./pages/input";
// import Input2 from"./pages/input2";
// import List from"./pages/list";

function App() {
  return (
    <div className="App">
      {/* <nav><Link to="/main2">Main2</Link> </nav> 
      <nav><Link to="/main">Main</Link> </nav> */}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/nav" element={<Nav />} />
        <Route path="/userjoin" element={<Userjoin />} />
        <Route path="/findid" element={<Findid />} />
        <Route path="/findpw" element={<Findpw />} />
        <Route path="/findpwresult" element={<Findpwresult />} />
        <Route path="/findidresult" element={<Findidresult />} />
        <Route path="/main" element={<Main />} />
        <Route path="/main2" element={<Main2 />} />
        <Route
          path="/calendarrecords"
          element={
            <PrivateRoute>
              <Calendarrecords />
            </PrivateRoute>
          }
        />
        <Route path="/detail/:id" element={<Eventdetail />} />
        <Route
          path="/mypage"
          element={
            <PrivateRoute>
              <Mypage />
            </PrivateRoute>
          }
        />
        <Route path="/account" element={<Account />} />
        <Route path="/passwordchange" element={<Passwordchange />} />
        <Route path="/myposts" element={<Myposts />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/performance/:id" element={<Performancedetail />} />
        <Route path="/addrecord" element={<Addrecord />} />
        <Route path="/modifyrecord/:id" element={<Modifyrecord />} />
        <Route
          path="/mylikescalendar"
          element={
            <PrivateRoute>
              <Mylikescalendar />
            </PrivateRoute>
          }
        />
        <Route
          path="/myreport"
          element={
            <PrivateRoute>
              <Myreport />
            </PrivateRoute>
          }
        />
              <Route path="/community" element={<Community />} />
      </Routes>

    </div>
  );
}

export default App;
