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
  const [activeTripId, setActiveTripId] = useState(null);

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

  const fetchActiveTrip = useCallback(async (currentToken) => {
    if (!currentToken) return;

    // TODO: 실제 진행 중인 여행을 확인하는 API 엔드포인트로 변경하세요.
    const TRIP_STATUS_API_URL = `${API_BASE}/trips/isActiveTrips`; 

    try {
      const res = await fetch(TRIP_STATUS_API_URL, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      if (!res.ok) {
        console.error(`여행 상태 API 오류: ${res.status}`);
        return;
      }

      const json = await res.json();
      
      if (json.isSuccess && json.result) {
        const { isOngoing, trip } = json.result;

        if (isOngoing && Array.isArray(trip) && trip.length > 0) {
          // 진행 중인 여행이 있으면, 배열의 첫 번째 여행 ID를 사용
          const ActiveTripId = trip[0].id;
          // selectActiveTrip을 사용하여 상태 업데이트 및 로컬 스토리지에 저장
          selectActiveTrip(ActiveTripId); 
          console.log(`진행 중인 여행 ID를 찾았습니다: ${ActiveTripId}`);
        } else {
          // 진행 중인 여행이 없으면 초기화
          selectActiveTrip(null);
          console.log("현재 진행 중인 여행이 없습니다.");
        }
      }
    } catch (err) {
      console.error("진행 중인 여행 로드 실패:", err);
    }
  }, []); // 의존성 배열은 비워둡니다. (API_BASE, selectActiveTrip이 바뀌지 않는다고 가정)


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
    const savedToken = localStorage.getItem("activeTripId");
    const savedTripId = localStorage.getItem("activeTripId");
    if (savedTripId) {
      setActiveTripId(Number(savedTripId));
    }

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
