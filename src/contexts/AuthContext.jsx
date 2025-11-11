// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext } from 'react';

// 1. Context 생성
const AuthContext = createContext();

// 2. Provider 컴포넌트 (데이터 공급자)
export const AuthProvider = ({ children }) => {
  // user 정보 (초기값 null)
  const [user, setUser] = useState(null); 
  // 우리 BE 서버가 줄 토큰 (지금은 카카오 토큰 임시 저장)
  const [token, setToken] = useState(null); 
  const [activeTripId, setActiveTripId] = useState(null); //활성여행id

  // 3. 로그인 성공 시 호출될 함수 (가장 중요!)
  const loginWithKakao = async (accessToken) => {
    try {
      // 4. access_token으로 카카오 사용자 정보 API 호출
      const response = await fetch('https://kapi.kakao.com/v2/user/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`, // 헤더에 토큰 싣기
          'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
        }
      });
      
      const kakaoData = await response.json();

      if (!kakaoData.id) {
        throw new Error("카카오 사용자 정보를 가져오지 못했습니다.");
      }

      console.log("카카오 사용자 정보:", kakaoData);

      // 5. 전역 Context State에 실제 카카오 정보 저장
      setUser({
        username: kakaoData.properties.nickname,
        profileImage: kakaoData.properties.profile_image,
        bio: "", // 상메(bio)는 요청대로 비워둠
        // (이후 BE에서 앨범, 친구 수 등도 받아와서 채워야 함)
        albums: [], 
        postCount: 0,
        friendCount: 0
      });

      // (임시) BE 토큰 대신 카카오 토큰 저장
      setToken(accessToken);

      // (향후) TODO: BE에 access_token을 보내고 우리 서버 JWT를 받아 setToken(jwt)
      
      // 👇 2. 로그인 성공 시, 활성 여행 ID를 임시로 설정
      // (나중에 이 부분은 BE에서 "활성 여행" 정보를 받아와서 설정해야 함)
      //setActiveTripId('jeju-trip-123'); 
      //console.log("AuthContext: 활성 여행 ID 'jeju-trip-123' 설정됨");

      return true; // 로그인 성공

    } catch (error) {
      console.error("카카오 로그인 처리 실패:", error);
      setUser(null);
      setToken(null);
      return false; // 로그인 실패
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    // TODO: 카카오 로그아웃 API 호출
  };

  // user, setUser (상메 수정용), login 함수를 하위 컴포넌트에 제공
  return (
    <AuthContext.Provider value={{ user, setUser, token, loginWithKakao, logout ,activeTripId,setActiveTripId}}>
      {children}
    </AuthContext.Provider>
  );
};

// 6. 다른 컴포넌트에서 쉽게 쓸 수 있도록 custom hook 생성
export const useAuth = () => useContext(AuthContext);