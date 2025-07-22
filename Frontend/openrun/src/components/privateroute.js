import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const isLoggedIn = !!localStorage.getItem("token"); // 로그인 여부 판단

  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;