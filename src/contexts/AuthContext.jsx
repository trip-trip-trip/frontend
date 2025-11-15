import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTripId, setActiveTripId] = useState(null);

  const fetchUserProfile = useCallback(async (currentToken) => {
    if (!currentToken) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/user/me`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      if (!res.ok) throw new Error("토큰이 유효하지 않습니다.");

      const data = await res.json();
      if (data.isSuccess) {
        setUser(data.result);
      }
    } catch (err) {
      console.error("사용자 정보 로드 실패:", err);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("jwtToken");
    if (storedToken) {
      setToken(storedToken);
      fetchUserProfile(storedToken);
    } else {
      setIsLoading(false);
    }
  }, [fetchUserProfile]);

  const login = (jwtToken) => {
    localStorage.setItem("jwtToken", jwtToken);
    setToken(jwtToken);
  };

  const logout = () => {
    localStorage.removeItem("jwtToken");
    setUser(null);
    setToken(null);
    setActiveTripId(null);
  };

  // ⭐ 카카오 로그인 (백엔드 code 방식)
  const loginWithKakao = async (code) => {
    try {
      const response = await fetch(`/api/login/start/kakao?code=${code}`);
      const data = await response.json();

      if (!data.isSuccess) {
        throw new Error(data.message);
      }

      const { level, jwtToken } = data.result;

      if (level === "access") {
        login(jwtToken);
        return { level: "access", token: jwtToken };
      } else {
        return { level: "signup", token: jwtToken };
      }

    } catch (err) {
      console.error("카카오 로그인 연동 실패:", err);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loginWithKakao,
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
