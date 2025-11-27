import React, { useState, lazy, Suspense, useEffect } from 'react'
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";

import './Home.css'
import Navbar from '../../components/NavBar/NavBar'
import Header from '../../components/Header/Header' 

import ActiveTrip from '../../components/Album/ActiveTrip';
import new_trip from '/new_trip.png';
import plus_btn from '/icons/plus_icon.png';

const TabAll = lazy(() => import('./tabs/TabAll'));
const TabPlace = lazy(() => import('./tabs/TabPlace'));

const API_BASE = import.meta.env.PROD 
    ? (import.meta.env.VITE_API_BASE_URL || 'https://tripshot.duckdns.org') 
    : '/api';

const Home = () => {
  const { user, login, setUser, isLoading, activeTripId, token } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [homeTripInfo, setHomeTripInfo] = useState(null);

  // 1. 소셜 로그인 처리
  useEffect(() => {
    const tokenParam = params.get("token");
    const userStr = params.get("user");
    if (tokenParam && userStr) {
        const url = new URL(window.location);
        url.searchParams.delete('token'); url.searchParams.delete('user'); url.searchParams.delete('level');
        window.history.replaceState({}, '', url);
        if (!user) {
            try {
                login(tokenParam, JSON.parse(decodeURIComponent(userStr)));
            } catch (err) { console.error(err); }
        }
    }
  }, [params, user, login, setUser]); 

  // 탭 설정
  const getInitialTab = () => {
    const p = new URLSearchParams(window.location.search).get('tab');
    return p === 'place' ? 'place' : 'all';
  };
  const [tab, setTab] = useState(getInitialTab);

  useEffect(() => {
    const url = new URL(window.location);
    url.searchParams.set('tab', tab);
    window.history.replaceState({}, '', url);
  }, [tab]);

  useEffect(() => {
    // Navbar에서 보낸 { activeTab: 'feed' } 신호가 있는지 확인
    if (location.state?.activeTab === 'feed') {
        setTab('all'); // 'all'이 피드 탭이므로 변경
        
        window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // 여행 상태 조회
  // useEffect(() => {
  //   const fetchActiveTripStatus = async () => {
  //     if (!token) return;

  //     try {
  //       const response = await fetch(`${API_BASE}/trips/isActiveTrips`, {
  //         method: "GET",
  //         headers: {
  //           "Content-type": "application/json",
  //           "Authorization": `Bearer ${token}`, 
  //         },
  //       });

  //       if (response.ok) {
  //         const data = await response.json();
          
  //         if (data.isSuccess && data.result && data.result.isOngoing) {
  //            const tripList = Array.isArray(data.result.trip) ? data.result.trip : [];
  //            const activeData = tripList.find(item => item.status === 'ACTIVE');

  //            if (activeData) {
  //               const contents = activeData.contents || {};
  //               const photos = contents.photos || [];
  //               const videos = contents.reelItems || [];

  //               setHomeTripInfo({
  //                 id: activeData.id,
  //                 title: activeData.title,
  //                 startDate: activeData.startDate,
  //                 endDate: activeData.endDate,
  //                 members: (activeData.inviteesTagList || []).map((tag, index) => ({
  //                   name: activeData.inviteesProfileImgList?.[index] || tag,
  //                   profile: activeData.inviteesNameList?.[index] || '',
  //                   tag: tag
  //                 })),
  //                 image: photos.map(p => p.media?.url || ''), 
  //                 film_count: photos.length, 
  //                 vid_count: videos.length,
  //               });
  //            } else {
  //               setHomeTripInfo(null); 
  //            }
  //         } else {
  //           setHomeTripInfo(null); 
  //         }
  //       }
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };
    
  //   fetchActiveTripStatus();
  // }, [token]); 
  // 여행 상태 조회 (useEffect로 감싸서 실행)
  useEffect(() => {
    const fetchActiveTripStatus = async () => {
      if (!token) return;

      try {
        // 1. /trips로 모든 여행 목록을 가져옵니다.
        const response = await fetch(`${API_BASE}/trips`, { 
            method: "GET",
            headers: {
                "Content-type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            const tripList = data.result || [];
            const today = new Date().toISOString().split('T')[0];
            // today.setHours(0, 0, 0, 0); 

            const activeData = tripList.find(item => {
                // 상태가 ACTIVE인지 확인
                if (item.trip.status !== 'ACTIVE') return false;

                // 날짜가 지났는지 확인 (종료일이 오늘보다 과거라면 false)
                const endDate = new Date(item.trip.endDate);
                
                // 여행 종료일이 오늘보다 크거나 같아야 함 (아직 안 끝남)
                return endDate >= today; 
            });

            if (activeData) {
                const { trip, contents } = activeData;
                
                const photos = contents?.photos || [];
                const videos = contents?.reelItems || [];

                setHomeTripInfo({
                    id: trip.id,
                    title: trip.title,
                    startDate: trip.startDate,
                    endDate: trip.endDate,
                    placeName: trip.placeName,
                    members: (trip.inviteesTagList || []).map((tag, index) => ({
                        name: trip.inviteesProfileImgList?.[index] || tag,
                        profile: trip.inviteesNameList?.[index] || '',
                        tag: tag
                    })),
                    image: photos.map(p => p.media?.url || ''),
                    film_count: photos.length, // 사진 개수 정상 표시
                    vid_count: videos.length,
                });
            } else {
                setHomeTripInfo(null);
            }
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchActiveTripStatus();
  }, [token]); // token이 있을 때 실행

  // --- 클릭 핸들러 ---
  const handleGoCamera = (e) => {
    e.stopPropagation();
    if (homeTripInfo?.id) {
        navigate(`/camera/${homeTripInfo.id}`, {
            state: { tripState: 'active' } 
        });
    }
  };

  // 2) 여행 상세 이동
  const handleGoTripDetail = (e) => {
    e.stopPropagation();
    if (homeTripInfo?.id) {
        navigate(`/trips/detail/${homeTripInfo.id}`, {
            state: {
                tripState: 'active',
                tripId: homeTripInfo.id,
                title: homeTripInfo.title,  
                startDate: homeTripInfo.startDate,
                endDate: homeTripInfo.endDate,
                members: homeTripInfo.members,
            }
        });
    }
  };

  // 3) 여행 수정 이동
  const handleGoEdit = (e) => {
    e.stopPropagation();
    if (homeTripInfo?.id) {
        navigate(`/trips/detail/${homeTripInfo.id}/edit`);
    }
  };

  if (isLoading) {
    <div className="home">
      <Header/>
        <div className="ment">
          불러오는 중...
        </div>
      <Navbar/>
    </div>
  }
    
  return (
    <div className="home">
      {tab !== 'place' && <Header setTab={setTab} currentTab={tab} />}

      <main className="home-body" role="tabpanel">
        
        {tab === 'all' && (
          <div className="home-trip-section">
            {homeTripInfo ? (
              <div className="active-trip-wrapper">
                <ActiveTrip 
                  tripName={homeTripInfo.title}
                  placeName={homeTripInfo.placeName}
                  members={homeTripInfo.members || []}
                  img={homeTripInfo.image || []}
                  filmCount={homeTripInfo.film_count || 0}
                  vidCount={homeTripInfo.vid_count || 0}
                  startDate={homeTripInfo.startDate}
                  endDate={homeTripInfo.endDate}
                />

                <div className="hitbox-info" onClick={handleGoTripDetail}></div>
                <div className="hitbox-camera" onClick={handleGoCamera}></div>
                <div className="hitbox-edit" onClick={handleGoEdit}></div>
              </div>
            ) : (
              <div className="new-trip-container" onClick={() => navigate('/trips/places')}>
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