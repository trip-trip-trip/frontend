import React, {useState, lazy, Suspense, useEffect} from 'react'
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

  // 소셜 로그인 redirect 처리
  useEffect(() => {
    const token = params.get("token");
    const userStr = params.get("user");

    if (token && userStr && !user) {
      login(token);

      try {
        const decodedUser = JSON.parse(decodeURIComponent(userStr));
        setUser(decodedUser);
        localStorage.setItem("user", JSON.stringify(decodedUser));
      } catch (err) {
        console.error("유저 파싱 오류:", err);
      }
    }
  }, [user, login, setUser]);

  // 항상 hook은 실행되어야 한다
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
  }, [activeTripId]);

  useEffect(() => {
    const url = new URL(window.location);
    url.searchParams.set('tab', tab);
    window.history.replaceState({}, '', url);
  }, [tab]);

  // ❗ hook 다 실행된 후에 UI에서만 isLoading 판단
  return (
    <div className="home">
      {isLoading ? (
        <div>불러오는 중...</div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

export default Home;
