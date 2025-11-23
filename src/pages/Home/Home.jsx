import React, { useState, lazy, Suspense, useEffect } from 'react'
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";

import './Home.css'
import Navbar from '../../components/NavBar/NavBar'
import Header from '../../components/Header/Header' 

import ActiveTrip from '../../components/Album/ActiveTrip';
import new_trip from '/new_trip.png';
import plus_btn from '/icons/plus_icon.png';

const TabAll = lazy(() => import('./tabs/TabAll'));
const TabPlace = lazy(() => import('./tabs/TabPlace'));

const Home = () => {
  const { user, login, setUser, isLoading, activeTripId, token } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const [homeTripInfo, setHomeTripInfo] = useState(null);

  // 소셜 로그인 redirect 처리 및 Context 업데이트 로직 (활성화)
  useEffect(() => {
    const token = params.get("token");
    const userStr = params.get("user");

    // token과 userStr이 있고, Context의 user가 null일 때 (새 로그인) 또는 URL에 정보가 있을 때 처리
    if (token && userStr) {
        
        // 1. URL에서 파라미터 제거 (URL 클리닝)
        const url = new URL(window.location);
        url.searchParams.delete('token');
        url.searchParams.delete('user');
        url.searchParams.delete('level');
        window.history.replaceState({}, '', url);
        
        // 2. Context에 유저 정보가 없거나, URL에 새 정보가 있을 경우 업데이트
        if (!user) {
            try {
                const decodedUser = JSON.parse(decodeURIComponent(userStr));
                
                // ⭐ AuthContext의 login 함수를 사용하여 토큰과 사용자 정보를 Context에 저장
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
  useEffect(() => {
    const fetchActiveTripStatus = async () => {
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE}/trips/isActiveTrips`, {
          method: "GET",
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.isSuccess && Array.isArray(data.result)) {
             
             // 배열 중에서 status가 "ACTIVE"인 여행을 찾음
             const activeData = data.result.find(item => item.trip.status === 'ACTIVE');

             if (activeData) {
                const t = activeData.trip;       // 여행 기본 정보
                const c = activeData.contents;   // 사진/영상 개수 정보

                setHomeTripInfo({
                  id: t.id,
                  title: t.title,
                  startDate: t.startDate,
                  endDate: t.endDate,
                  // JSON 데이터 매핑 (주의: JSON에서 inviteesNameList에 이미지 URL이 들어있음)
                  members: (t.inviteesTagList || []).map((tag, index) => ({
                    name: t.inviteesProfileImgList?.[index] || tag, // 이름이 없으면 태그 사용
                    profile: t.inviteesNameList?.[index] || '',     // JSON상 여기에 URL이 있음
                    tag: tag
                  })),
                  // 커버 이미지: 사진이 있으면 첫번째 사진 URL
                  image: c.photos && c.photos.length > 0 ? c.photos.map(p => p.media.url) : [],
                  film_count: c.photos ? c.photos.length : 0,
                  vid_count: c.reelItems ? c.reelItems.length : 0,
                });
             } else {
                setHomeTripInfo(null); // 진행중인 여행이 없음
             }
          } else {
            setHomeTripInfo(null);
          }
        }
      } catch (error) {
        console.error("여행 상태 확인 실패:", error);
      }
    };

    fetchActiveTripStatus();
  }, [token, API_BASE]);

  //  [카메라 이동 함수]
  const handleGoCamera = () => {
    if (homeTripInfo && homeTripInfo.id) {
      navigate(`/camera/${homeTripInfo.id}`);
    } else {
      alert("촬영 가능한 여행이 없습니다.");
    }
  };

  if (isLoading) return <div>불러오는 중...</div>;

  return (
    <div className="home">
      {tab !== 'place' && <Header setTab={setTab} currentTab={tab} />}

      <main className="home-body" role="tabpanel">
        
        {/* 탭이 'all' (피드) 일 때만 상단에 여행 상태 표시 */}
        {tab === 'all' && (
          <div className="home-trip-section">
            {homeTripInfo ? (
              // 여행 중일 때: 카드를 클릭하면 카메라로 이동
              <div onClick={handleGoCamera} style={{cursor: 'pointer'}}>
                <ActiveTrip 
                  tripName={homeTripInfo.title}
                  members={homeTripInfo.members || []}
                  img={homeTripInfo.image || []}
                  filmCount={homeTripInfo.film_count || 0}
                  vidCount={homeTripInfo.vid_count || 0}
                  startDate={homeTripInfo.startDate}
                  endDate={homeTripInfo.endDate}
                />
              </div>
            ) : (
              //  여행 중이 아닐 때: 새 여행 만들기
              <div className="new-trip-container" onClick={() => navigate('/trips/create')}>
                <div className="new-trip-img">
                  <img src={new_trip} alt="new trip" />
                </div>
                <div className="new-trip-text">
                  <img src={plus_btn} alt="plus" />
                  <h1>새로운 여행 만들기</h1>
                </div>
              </div>
            )}
          </div>
        )}

        <Suspense fallback={<div className="skeleton">불러오는 중…</div>}>
          {tab === 'all' ? (
            <TabAll activeTrip={homeTripInfo} setTab={setTab} />  
          ) : (
            <TabPlace activeTrip={homeTripInfo} setTab={setTab} /> 
          )}
        </Suspense>
      </main>
      <Navbar />
    </div>
  );
};
  
export default Home;
