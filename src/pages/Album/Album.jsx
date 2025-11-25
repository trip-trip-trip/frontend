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
import Upcoming from '../../components/Album/UpcomingTrip';


const Album = () => {
  const API_BASE = import.meta.env.PROD 
    ? (import.meta.env.VITE_API_BASE_URL || 'https://tripshot.duckdns.org') 
    : '/api';
  const [isLoading, setIsLoading] = useState(true); 
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0); // 로컬 시간대의 오늘 자정
  
  const navigate = useNavigate();
  const { token, activeTripId, setActiveTripId } = useAuth();

  // const API_BASE = 'https://tripshot.duckdns.org';
  // const token = 'eyJhbGciOiJIUzUxMiJ9.eyJsdmwiOiJBQ0NFU1MiLCJzdWIiOiIzNCIsImlhdCI6MTc2NDA4NDk1NSwiZXhwIjoxNzY0MDg4NTU1fQ.Az8aDvqOtN7r4ynhDhCc8sf8lNx6nCop1AjeLKoasLuQjAa_l2GgU2o9VCrGinFPBGuwja_xKzWsklbN4ABYlQ';

  // 3. 활성 여행의 '정보' (제목, 날짜 등)를 담을 state
  const [activeShotCount, setActiveShotCount] = useState(0);
  const [tripData, setTripData] = useState({});
  // 날짜에 따라 여행 -> 시작/완료/대기중 구분
  const [activeTripInfo, setActiveTripInfo] = useState(null);
  const [completedTrips, setCompletedTrips] = useState([]);
  const [plannedTrips, setPlannedTrips] = useState([]);
  
  // 친구 초대 요청 존재 여부
  const [hasInviteRequest, setHasInviteRequest] = useState();
  // 친구 초대 요청 저장
  const [tripRequest, setTripRequest] = useState();


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

  //여행 초대 정보
  const fetchInvitations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/invitations`,
        {
          method: "GET",
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`여행 상세정보 조회 실패: ${response.status}`);
      }
      const data = await response.json();
      const fetchedInvitation = data.result;

      if (fetchedInvitation?.length > 0){
        setHasInviteRequest(true);
        setTripRequest(fetchedInvitation[0]);
        console.log(fetchedInvitation);
      }

    } catch (error) {
      console.error("Error fetching invitation data:", error);
    }
  };


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
          const startDateObj = new Date(trip.startDate);
          startDateObj.setHours(0, 0, 0, 0);
          
          const endDateObj = new Date(trip.endDate);
          endDateObj.setHours(0, 0, 0, 0); // (매우 중요) 종료일도 자정으로 통일
          
          const tripData = {
            id: trip.id,
            placeName: trip.placeName,
            title: trip.title,
            startDate: trip.startDate,
            endDate: trip.endDate,
            members: (trip.inviteesNameList || []).map((name, index) => ({
                name: name,
                profile: trip.inviteesProfileImgList[index] || 'none',
                tag: trip.inviteesTagList[index] || ''
            })),
            film_count: contents.photos.length,
            vid_count: contents.reelItems.length,
            image: contents.photos.map(p => p.media.url),
            coverImage: contents.photos.length > 0 ? contents.photos[0].media.url : null, // 첫 번째 사진을 커버 이미지로
          };

          if (startDateObj > todayDate) {
            plannedTrip.push(tripData);
          } else if (endDateObj >= todayDate){
            activeTrips.push(tripData);
          } else{
            completedList.push(tripData);
          }


          // if (trip.endDate < todayDate) {
          //   completedList.push(tripData);
          // } else if (trip.startDate > todayDate) {
          //   plannedTrip.push(tripData);
          // } else {
          //   activeTrips.push(tripData);
          // }
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
      }
    }
  
    useEffect(() => {
      async function initialDataFetch() {
        setIsLoading(true);
        try {
          await Promise.all([
            fetchTrips(),
            fetchInvitations()
          ]);
        } catch (error) {
          console.error("Initial data fetch failed:", error);
        } finally {
          setIsLoading(false); // 마지막에 한 번만 해제
        }
      }
      if (token) {
        initialDataFetch();
      } else {
        setIsLoading(false);
        navigate('/login');
      }
    // ...
    }, [token, activeTripId]);

  
  // // 친구 초대 요청에서 <거절> 클릭 시 동작
  // const handleRejectRequest = () => {
  //   setHasInviteRequest(false);
  //   alert("친구의 요청을 거절했어요.");
  // }

  // 친구 초대 요청에서 <수락> 클릭 시 동작
  // const handleAcceptRequest = () => {
  //   setHasInviteRequest(false);
  //   if (!activeTripId){
  //     const newTripId = `${tripRequest.title.replace(/\s/g, '-')}-${new Date().getTime()}`;
  //     const newTripInfo = {
  //       id: newTripId,
  //       title : tripRequest.title,
  //       startDate : tripRequest.startDate,
  //       vid_count: 0,
  //       film_count: 0,
  //       endDate : tripRequest.endDate,
  //       members : tripRequest.members,
  //       coverImage : tripRequest.coverImage || '',
  //       image: [],
  //     }

  //     localStorage.setItem(`tripInfo_${newTripId}`, JSON.stringify(newTripInfo));
  //     const ids = JSON.parse(localStorage.getItem('tripIds') || '[]');
  //     localStorage.setItem('tripIds', JSON.stringify([...new Set([...ids, newTripId])]));
  //     // setActiveTrip(newTripInfo);
  //     setActiveTripId(newTripId);
  //     setHasInviteRequest(false);
      
  //     // setActiveTripInfo({
  //     //   title : tripRequest.title,
  //     //   startDate : tripRequest.startDate,
  //     //   endDate : tripRequest.endDate,
  //     //   members : tripRequest.members,
  //     //   image : tripRequest.image,
  //     // })
  //     // setHasActiveTrip(true);
  //     alert("새 여행이 생성되었습니다.");
  //     // console.log(activeTripInfo);
  //   }
  // }

  if (isLoading) {
    return (
      <div className='album'>
        <Header/>
          <div className="album-container">
            <div className="ment">여행 정보를 불러오는 중...</div>
          </div>
        <Navbar/>
      </div>
    );
  }
  
return(
    <div className='album'>
      <Header/>
        {/* <button className='add-trip-btn' onClick={handleCreateBtn}>+</button> */}
        <div className="album-container">
        <div className={`request-cont ${activeTripId ? 'active' : 'nonactive'}`}>
          {/* 친구 초대 요청이 있으면 요청 표시 */}
        { hasInviteRequest
          ? <FriendRequest 
              data={tripRequest}/> 
          : <></>}
        </div>
        
        {/* 활성화된 여행 있으면 표시 */}
        <div className="album-active-cont">
          {activeTripId
            ? <ActiveTrip tripName={activeTripInfo?.title}
                          placeName={activeTripInfo?.placeName}
                          tripId = {activeTripId}
                          members={activeTripInfo?.members || []}
                          img={activeTripInfo?.image || []}
                          filmCount={activeTripInfo?.film_count || 0}
                          vidCount={activeTripInfo?.vid_count || 0}
                          startDate={activeTripInfo?.startDate}
                          endDate={activeTripInfo?.endDate}
                          />
            : <div className="new-trip-container" onClick={()=>navigate('/trips/places')}>
                <div className="new-trip-img">
                  <img src={new_trip} alt="" />
                </div>
                <div className="new-trip-text">
                  <img src={plus_btn} alt="" />
                  <h1>새로운 여행 만들기</h1>
                </div>
            </div> 
            }
        </div>

        {/* --- 예정된 여행 섹션 --- */}
        {
          (plannedTrips.length > 0) &&
          <div className="completed-album">
            <h2 className="section-title">예정된 여행</h2>
          <div className="upcoming-trips-list">
            {plannedTrips.map((trip, index) => (
              <div 
                key = {index}
                className="upcoming-trip-item">
                <Upcoming
                  tripId = {trip.id}
                  placeName={trip.placeName}
                  title={trip.title}
                  startDate={trip.startDate}
                  endDate={trip.endDate}
                  members={trip.members}
                  coverImage={trip.coverImage}
                  images={trip.image}
                />
              </div>
            ))}
          </div> 
        </div>
        }
        

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
                  placeName={trip.placeName}
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