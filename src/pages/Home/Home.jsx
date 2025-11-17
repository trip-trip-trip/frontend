import React, { useState, lazy, Suspense, useEffect } from 'react'
import { useAuth } from "../../contexts/AuthContext";
import { useSearchParams } from "react-router-dom";

import './Home.css'
import Navbar from '../../components/NavBar/NavBar'
import Header from '../../components/Header/Header' 

const TabAll = lazy(() => import('./tabs/TabAll'));
const TabPlace = lazy(() => import('./tabs/TabPlace'));

const Home = () => {
  const { user, login, setUser, isLoading, activeTripId } = useAuth();
  const [params] = useSearchParams();

  //소셜 로그인 redirect 처리 및 Context 업데이트 로직 (활성화)
  useEffect(() => {
    const token = params.get("token");
    const userStr = params.get("user");

    // token과 userStr이 있고, Context의 user가 null일 때 (새 로그인) 또는 URL에 정보가 있을 때 처리
    if (token && userStr) {
        
        // URL에서 파라미터 제거 (URL 클리닝)
        const url = new URL(window.location);
        url.searchParams.delete('token');
        url.searchParams.delete('user');
        url.searchParams.delete('level');
        window.history.replaceState({}, '', url);
        
        //  Context에 유저 정보가 없거나, URL에 새 정보가 있을 경우 업데이트
        if (!user) {
            try {
                const decodedUser = JSON.parse(decodeURIComponent(userStr));
                
                // AuthContext의 login 함수를 사용하여 토큰과 사용자 정보를 Context에 저장
                login(token, decodedUser);
                
            } catch (err) {
                console.error("유저 파싱 오류:", err);
            }
        }
    }
    // user, login, setUser를 의존성 배열에 명시하여 Context 상태 변경 시 재실행되도록 보장
  }, [params, user, login, setUser]); 

  // 탭 상태 초기화
  const getInitialTab = () => {
    const p = new URLSearchParams(window.location.search).get('tab');
    return p === 'place' ? 'place' : 'all';
  };

  const [tab, setTab] = useState(getInitialTab);
  const [activeTrip, setActiveTrip] = useState(null);

  // 현재 진행 중인 여행 정보 로드 (activeTripId가 Context에서 변경될 때)
  useEffect(() => {
    if (activeTripId) {
      const tripInfoKey = `tripInfo_${activeTripId}`;
      const savedTripInfo = JSON.parse(localStorage.getItem(tripInfoKey));
      setActiveTrip(savedTripInfo);
    } else {
      setActiveTrip(null);
    }
  }, [activeTripId]);

  // 탭 변경 시 URL 쿼리 파라미터 업데이트
  useEffect(() => {
    const url = new URL(window.location);
    url.searchParams.set('tab', tab);
    window.history.replaceState({}, '', url);
  }, [tab]);

  // Context의 isLoading 상태에 따라 로딩 화면 표시
  if (isLoading) return <div>불러오는 중...</div>;

  return (
    <div className="home">
      {tab !== 'place' && <Header setTab={setTab} currentTab={tab} />}

      <main className="home-body" role="tabpanel">
        <Suspense fallback={<div className="skeleton">불러오는 중…</div>}>
          {tab === 'all' ? (
            <TabAll activeTrip={activeTrip} setTab={setTab} />  
          ) : (
            <TabPlace activeTrip={activeTrip} setTab={setTab} /> 
          )}
        </Suspense>
      </main>

      <Navbar />
    </div>
  );
};

export default Home;
