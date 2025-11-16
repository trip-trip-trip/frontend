// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

// const API_BASE = import.meta.env.VITE_API_BASE_URL; // (BE API 완성 전까지 주석)

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // [수정] 초기값 true
  const [activeTripId, setActiveTripId] = useState(null);

  // BE API가 없으므로 이 함수는 일단 주석 처리
  /*
  const fetchUserProfile = useCallback(async (currentToken) => {
    if (!currentToken) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/user/me`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (!res.ok) throw new Error("토큰이 유효하지 않습니다.");
      const data = await res.json();
      if (data.isSuccess) {
        setUser(data.result);
        localStorage.setItem("user", JSON.stringify(data.result));  
      }
    } catch (err) {
      console.error("사용자 정보 로드 실패:", err);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, []);
  */

  // [수정] 앱이 켜질 때 localStorage에서 토큰과 "user"를 바로 로드
  useEffect(() => {

    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      setUser(JSON.parse(savedUser)); 
    }
    setIsLoading(false); 
  }, []);

  // [수정] login 함수가 Home.jsx에서 호출될 때 토큰만 저장
  const login = (jwtToken, userObject) => {
    localStorage.setItem("jwtToken", jwtToken);
    setToken(jwtToken);
    
    // ⭐ 새로운 사용자 정보를 Context와 LocalStorage에 저장
    setUser(userObject); 
    if (userObject) {
        localStorage.setItem("user", JSON.stringify(userObject));
    }
  };

  const logout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("user"); 
    setUser(null);
    setToken(null);
    setActiveTripId(null);
  };

  // (loginWithKakao 함수는 Login.jsx가 사용하지 않으므로 주석 처리)
  // const loginWithKakao = async (code) => { ... };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        setUser, // 👈 Home.jsx가 user를 저장할 수 있게
        login,
        logout,
        // loginWithKakao,
        activeTripId,
        setActiveTripId,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);