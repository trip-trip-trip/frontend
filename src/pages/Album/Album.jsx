// src/pages/Album/Album.jsx
import React, { useState, useEffect } from 'react'
import FriendRequest from '../../components/Album/friendRequest';
import ActiveTrip from '../../components/Album/ActiveTrip';
import './Album.css'
import EndedTripItem from '../../components/Album/EndedTripItem';
import { Link, useLocation, useNavigate } from 'react-router-dom'; 
import Navbar from '../../components/NavBar/NavBar';
import { useAuth } from '../../contexts/AuthContext'; // 1. AuthContext 임포트
import Header from '../../components/Header/Header';
import new_trip from '/new_trip.png';
import plus_btn from '/icons/plus_icon.png'


const Album = () => {
  const API_BASE = import.meta.env.PROD 
    ? (import.meta.env.VITE_API_BASE_URL || 'https://tripshot.duckdns.org') 
    : '/api';
  const [isLoading, setIsLoading] = useState(true); 
  const todayDate = new Date().toISOString().split('T')[0];
  
  const navigate = useNavigate();
  const { token, activeTripId, setActiveTripId } = useAuth();

  // 3. 활성 여행의 '정보' (제목, 날짜 등)를 담을 state
  const [activeShotCount, setActiveShotCount] = useState(0);
  const [tripData, setTripData] = useState({});

  const [activeTripInfo, setActiveTripInfo] = useState(null);
  const [completedTrips, setCompletedTrips] = useState([]);
  const [plannedTrips, setPlannedTrips] = useState([]);
  
  // 친구 초대 요청 존재 여부
  const [hasInviteRequest, setHasInviteRequest]=useState(false);

  // 친구 초대 요청 정보 - 요청받기 위해 일단 더미값 채워둠
  const [tripRequest, setTripRequest] = useState({
    title: '제주도 여행',
    requestor: '김친구',
    startDate: '2025-11-12',
    endDate: '2025-12-12',
    members: ['김친구', '박친구'],
    image: ['/trip-img/trip4.jpeg','/trip-img/trip6.jpeg'],
    coverImage: '/trip-img/trip4.jpeg',
  });

  // setTripRequest({
  //   title: '제주도 여행',
  //   requestor: '김친구',
  //   dateRange : '2025.11.18-22',
  //   members: ['김친구', '박친구'],
  //   image: ['/trip-img/trip4.jpeg','/trip-img/trip6.jpeg'],
  // });

  useEffect(() => {    
    if (activeTripId) {
      // 촬영 횟수 불러오기
      const countKey = `totalShotCount_${activeTripId}`;
      const savedCount = localStorage.getItem(countKey);
      setActiveShotCount(Number(savedCount) || 0);

      // 4. localStorage에서 '여행 정보' 불러오기
      console.log({activeTripId})
      const tripInfoKey = `tripInfo_${activeTripId}`;
      const savedTripInfo = JSON.parse(localStorage.getItem(tripInfoKey));

    } else {
      // 7. 활성 여행이 없으면 모든 데이터 초기화
      setActiveShotCount(0);
    }
  }, [location, activeTripId]); // 8. activeTripId가 바뀔 때마다 실행

 
////-----------

  useEffect(() => {
    async function fetchTrips() {
      setIsLoading(true);
      
      if (!token) {
        console.error("인증 토큰(accessToken)이 로컬 스토리지에 없습니다. 로그인 상태를 확인하세요.");
        setIsLoading(false);
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE}/trips`,
          {
            method: "GET",
            headers: {
              "Content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`여행 목록 조회 실패: ${response.status}`);
        }

        const data = await response.json();
        const fetchedTrips = data.result || [];

        let completedList =[];
        let activeTrips = [];
        let plannedTrip = [];

        fetchedTrips.forEach(item => {
          const trip = item.trip;
          const contents = item.contents;
          
          const tripData = {
            id: trip.id,
            title: trip.title,
            startDate: trip.startDate,
            endDate: trip.endDate,
            members: (trip.inviteesNameList || []).map((name, index) => ({
                name: name,
                profile: trip.inviteesProfileImgList[index] || '',
                tag: trip.inviteesTagList[index] || ''
            })),
            film_count: contents.photos.length,
            vid_count: contents.reelItems.length,
            image: contents.photos.map(p => p.media.url),
            coverImage: contents.photos.length > 0 ? contents.photos[0].media.url : null, // 첫 번째 사진을 커버 이미지로
          };

          if (trip.endDate < todayDate) {
            completedList.push(tripData);
          } else if (trip.startDate > todayDate) {
            plannedTrip.push(tripData);
          } else {
            activeTrips.push(tripData);
          }
        });

        activeTrips.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        let newActiveTrip = null;
        if (activeTrips.length > 0) {
            newActiveTrip = activeTrips[0];
            // 활성 여행 ID가 바뀌었으면 AuthContext의 activeTripId를 업데이트
            if (newActiveTrip.id !== activeTripId) {
                // setActiveTripId는 AuthContext에서 로컬스토리지까지 업데이트하는 함수입니다.
                setActiveTripId(newActiveTrip.id); 
            }
        } else {
            // 진행 중인 여행이 하나도 없다면 activeTripId를 초기화
            if (activeTripId) {
                setActiveTripId(null);
            }
        }
        
        setActiveTripInfo(newActiveTrip);
        setCompletedTrips(completedList);
        setPlannedTrips(plannedTrip);

      } catch (error) {
        console.error("Error fetching trips:", error);
      }finally{
        setIsLoading(false);
      }
    }
    fetchTrips();
  }, [token, activeTripId]);

  if (isLoading) {
    return (
      <div className='album'>
        <Header/>
          <div className="album-container">
            <h1>여행 정보를 불러오는 중...</h1>
          </div>
        <Navbar/>
      </div>
    );
  }


  // 친구 초대 요청에서 <거절> 클릭 시 동작
  const handleRejectRequest = () => {
    setHasInviteRequest(false);
    alert("친구의 요청을 거절했어요.");
  }

  // 친구 초대 요청에서 <수락> 클릭 시 동작
  const handleAcceptRequest = () => {
    setHasInviteRequest(false);
    if (!activeTripId){
      const newTripId = `${tripRequest.title.replace(/\s/g, '-')}-${new Date().getTime()}`;
      const newTripInfo = {
        id: newTripId,
        title : tripRequest.title,
        startDate : tripRequest.startDate,
        vid_count: 0,
        film_count: 0,
        endDate : tripRequest.endDate,
        members : tripRequest.members,
        coverImage : tripRequest.coverImage || '',
        image: [],
      }

      localStorage.setItem(`tripInfo_${newTripId}`, JSON.stringify(newTripInfo));
      const ids = JSON.parse(localStorage.getItem('tripIds') || '[]');
      localStorage.setItem('tripIds', JSON.stringify([...new Set([...ids, newTripId])]));
      // setActiveTrip(newTripInfo);
      setActiveTripId(newTripId);
      setHasInviteRequest(false);
      
      // setActiveTripInfo({
      //   title : tripRequest.title,
      //   startDate : tripRequest.startDate,
      //   endDate : tripRequest.endDate,
      //   members : tripRequest.members,
      //   image : tripRequest.image,
      // })
      // setHasActiveTrip(true);
      alert("새 여행이 생성되었습니다.");
      // console.log(activeTripInfo);
    }
  }

  // 상단(헤더) <+> 클릭시 동작
  const handleCreateBtn = () => {
    if (activeTripId){
      alert("이미 활성화된 여행이 있어 새 여행을 만들 수 없습니다.")
      navigate('/trips');
    } else {
      navigate('/trips/create')
    }
  }

  // // CreateTrip에서 생성한 newTrip 읽기
  // useEffect(() => {
  //   const newActiveTrip = location.state?.newActiveTrip;
  //   if (newActiveTrip && !activeTrip) {
  //     setActiveTripInfo(newActiveTrip);
  //     setHasActiveTrip(true);
  //   }
  // }, [location.state, activeTrip]);


  
  
return(
    <div className='album'>
      <Header/>
        {/* <button className='add-trip-btn' onClick={handleCreateBtn}>+</button> */}
        <div className="album-container">
        {/* 친구 초대 요청이 있으면 요청 표시 */}
        { hasInviteRequest
          ? <FriendRequest 
              img={tripRequest.image}
              tripName={tripRequest.title}
              userName={tripRequest.requestor}
              onAccept={handleAcceptRequest}
              onReject={handleRejectRequest}/> 
          : <></>}
        {/* 활성화된 여행 있으면 표시 */}
        <div className="album-active-cont">
          {activeTripId
            ? <ActiveTrip tripName={activeTripInfo?.title}
                          tripId = {activeTripInfo?.id}
                          members={activeTripInfo?.members || []}
                          img={activeTripInfo?.image || []}
                          filmCount={activeTripInfo.film_count || 0}
                          vidCount={activeTripInfo.vid_count || 0}
                          startDate={activeTripInfo?.startDate}
                          endDate={activeTripInfo?.endDate}
                          />
            : <div className="new-trip-container" onClick={()=>navigate('/trips/create')}>
                <div className="new-trip-img">
                  <img src={new_trip} alt="" />
                </div>
                <div className="new-trip-text">
                  <img src={plus_btn} alt="" />
                  <h1>새로운 여행 만들기</h1>
                </div>
            </div> }
        </div>
        {/* --- 완료된 여행 섹션 --- */}
        <div className="completed-album">
          <h2 className="section-title">지난 여행 기록</h2>
          <div className="completed-trips-list">
          {completedTrips.length > 0 ? (
            completedTrips.map((trip, index) => (
              <div 
                key = {index}
                className="completed-trip-item">
                <EndedTripItem
                  tripId = {trip.id}
                  title={trip.title}
                  startDate={trip.startDate}
                  endDate={trip.endDate}
                  members={trip.members}
                  coverImage={trip.coverImage}
                  images={trip.image}
                />
              </div>
            ))
          ) : (
            <p className="no-completed-trips">아직 지난 여행 기록이 없어요.</p>
        )}
          </div> 
        </div>
      </div>
      <Navbar current="albumpage"/>
    </div>
    )
  }


export default Album