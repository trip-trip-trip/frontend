import React, { useEffect, useRef } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const LoginGuard = (_WrappedComponent) => {
  const WrappedComponent = _WrappedComponent;

  return function Guard(props) {
    const navigate = useNavigate();
    // useRef를 사용하여 alert가 이미 호출되었는지 추적
    const hasAlerted = useRef(false);
    const [isLoggedIn, setIsLoggedIn] = useState(null); // null=확인중, true/false=결과
    const { token, isLoading } = useAuth();

    useEffect(() => {
        if (isLoading) return;

        if (!token) {
            if (!hasAlerted.current) {
                alert("로그인이 필요합니다.");
                hasAlerted.current = true;
              }
            navigate("/login", { replace: true });
            setIsLoggedIn(false);
          } else{
            hasAlerted.current = false;
            setIsLoggedIn(true);
          }
    },[token, navigate]);

    if (isLoading){
        return null;
    }

    if (!token){
        return null;
    }

    return <WrappedComponent {...props} />;
  }
};

export default LoginGuard;