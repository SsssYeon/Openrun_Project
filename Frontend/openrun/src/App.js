import React from "react";
import {Routes, Route, Link} from "react-router-dom";

import Login from"./pages/login";
import Nav from"./components/nav";
import Userjoin from "./pages/userjoin";
import Findid from "./pages/findid";
import Findpw from "./pages/findpw";
import Findpwresult from "./pages/findpwresult";
import Findidresult from "./pages/findidresult";
import Main from "./pages/main";
import Main2 from "./pages/main2";
// import Counter from"./pages/counter";
// import Input from"./pages/input";
// import Input2 from"./pages/input2";
// import List from"./pages/list";

function App() {
  return (
    <div className="App">
      <nav><Link to="/main2">Main2</Link> </nav> 
      <nav><Link to="/main">Main</Link> </nav>
      
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/nav" element={<Nav />} />
        <Route path="/userjoin" element={<Userjoin />} />
        <Route path="/findid" element={<Findid />} />
        <Route path="/findpw" element={<Findpw />} />
        <Route path="/findpwresult" element={<Findpwresult />} />
        <Route path="/findidresult" element={<Findidresult />} />
        <Route path="/main" element={<Main />} />
        <Route path="/main2" element={<Main2 />} />
      </Routes>
    </div>
   );
}
//     <div className="App">
//       <nav>
//         <Link to="/">Home</Link> | <Link to="/about">About</Link> | {" "}
//         <Link to="/counter">Counter</Link> | {" "}
//         <Link to="/input">Input</Link> | {" "}
//         <Link to="/input2">Input2</Link> | {" "}
//         <Link to="/list">List</Link>
//       </nav>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/about" element={<About />} />
//         <Route path="/counter" element={<Counter />} />
//         <Route path="/input" element={<Input />} />
//         <Route path="/input2" element={<Input2 />} />
//         <Route path="/list" element={<List />} />
//       </Routes>
//     </div>


export default App;
