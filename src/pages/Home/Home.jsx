import React, {useState, lazy, Suspense, useEffect} from 'react'
import { useAuth } from "../../contexts/AuthContext";
import { useSearchParams } from "react-router-dom";

import './Home.css'
import Navbar from '../../components/NavBar/NavBar'
import Header from '../../components/Header/Header' 

const TabAll = lazy(() => import('./tabs/TabAll'));
const TabPlace = lazy(() => import('./tabs/TabPlace'));

const Home = () => {
  const { user,login, setUser, isLoading ,activeTripId} = useAuth();
  const [params] = useSearchParams();

  // 🔥 소셜 로그인 redirect 파라미터 처리
  useEffect(() => {
    const token = params.get("token");
    const userStr = params.get("user");
if (token && userStr && !user) {
      console.log("Home: URL 파라미터에서 user 정보를 Context에 저장합니다.");
         login(token); // 1. 토큰 저장
         try {
            const decodedUser = JSON.parse(decodeURIComponent(userStr));
            setUser(decodedUser); // 2. 유저 정보 저장
            localStorage.setItem("user", JSON.stringify(decodedUser));
         } catch (err) {
            console.error("유저 파싱 오류:", err);
         }
      }
    // 5. [수정] 의존성 배열에 params, user, login, setUser 추가
   }, [params, user, login, setUser]);

  // 앱 전체 로딩 화면 방지
  if (isLoading) return <div>불러오는 중...</div>;
  
  const getInitialTab = () => {
    const p = new URLSearchParams(window.location.search).get('tab');
    return p === 'place' ? 'place' : 'all';
  };

  const [tab, setTab] = useState(getInitialTab);
  const [activeTrip, setActiveTrip] = useState(null);

  useEffect(() => {
    if (activeTripId) {
      const tripInfoKey = `tripInfo_${activeTripId}`;
      const savedTripInfo = JSON.parse(localStorage.getItem(tripInfoKey));
      setActiveTrip(savedTripInfo);
    } else {
      setActiveTrip(null);
    }
   }, [activeTripId, location]); // 7. location 추가 (페이지 돌아올 때 갱신)

   useEffect(() => {
      const url = new URL(window.location);
      url.searchParams.set('tab', tab);
      window.history.replaceState({}, '', url);
   }, [tab]);
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
