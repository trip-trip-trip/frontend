// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.PROD
  ? (import.meta.env.VITE_API_BASE_URL || 'https://tripshot.duckdns.org')
  : '/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // 🔽 1. [수정] 초기값을 localStorage에서 읽어오기
const [activeTripId, setActiveTripId] = useState(() => {
    const savedTripId = localStorage.getItem("activeTripId");
    return savedTripId ? Number(savedTripId) : null;
  });

  // 🔽 2. [추가] ID를 저장/삭제하는 새 래퍼(wrapper) 함수
  const selectActiveTrip = (tripId) => {
    const idAsNumber = Number(tripId);
    if (tripId && !Number.isNaN(idAsNumber)) {
      localStorage.setItem("activeTripId", idAsNumber);
      setActiveTripId(idAsNumber);
    } else {
      // tripId가 null, 0, undefined, NaN일 경우
      localStorage.removeItem("activeTripId");
      setActiveTripId(null);
    }
  };
  const fetchUserProfile = useCallback(async (currentToken) => {
    if (!currentToken) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/users/me`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      if (!res.ok) {
        if (res.status === 401) {
          console.error("토큰 만료 또는 인증 실패");
          return;
        }
        throw new Error(`서버 오류: ${res.status}`);
      }

      // 🔥 여기서 단 한번만 json() 호출해야 함
      const json = await res.json();

      if (json?.result?.id) {
        setUser(json.result);
        localStorage.setItem("user", JSON.stringify(json.result));
      } else {
        throw new Error("서버 데이터 형식 오류");
      }

    } catch (err) {
      console.error("사용자 프로필 로드 실패:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem("jwtToken");

    if (savedToken) {
      setToken(savedToken);
      fetchUserProfile(savedToken);
    } else {
      setIsLoading(false);
    }
  }, [fetchUserProfile]);

  // 로그인
  const login = (jwtToken, userObject) => {
    localStorage.setItem("jwtToken", jwtToken);
    setToken(jwtToken);

    // 백엔드 응답 형식 맞춤
    const profile =
      userObject?.result?.user ??
      userObject?.user ??
      userObject;

    if (profile) {
      setUser(profile);
      localStorage.setItem("user", JSON.stringify(profile));
    }

    fetchUserProfile(jwtToken);
  };

  const logout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    selectActiveTrip(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        setUser,
        login,
        logout,
        activeTripId,
        setActiveTripId:selectActiveTrip,
        isLoading,
        fetchUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
