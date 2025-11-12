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


const Album = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeTripId } = useAuth(); // 2. Context에서 활성 ID 가져오기
  
  // 3. 활성 여행의 '정보' (제목, 날짜 등)를 담을 state
  const [activeTrip, setActiveTrip] = useState(null); 
  const [activeShotCount, setActiveShotCount] = useState(0);
  const [activeMediaList, setActiveMediaList] = useState([]);
  
  // 친구 초대 요청 존재 여부
  const [hasInviteRequest, setHasInviteRequest]=useState(true);

  //   // 활성화여행 존재 여부 
  // const [hasActiveTrip, setHasActiveTrip]=useState(false);
  //   // 활성화여행 정보
  // const [activeTripInfo, setActiveTripInfo] = useState({
  //   title: '',
  //   startDate: '',
  //   endDate: '',
  //   members: [],
  //   count: 0,
  //   image: [],
  //   thumbnail: '',
  // });

  // 친구 초대 요청 정보 - 요청받기 위해 일단 더미값 채워둠
  const [tripRequest, setTripRequest] = useState({
    title: '제주도 여행',
    requestor: '김친구',
    startDate: '2025-11-12',
    endDate: '2025-12-12',
    members: ['김친구', '박친구'],
    image: ['/trip-img/trip4.jpeg','/trip-img/trip6.jpeg'],
    thumbnail: '',
  });

  // setTripRequest({
  //   title: '제주도 여행',
  //   requestor: '김친구',
  //   dateRange : '2025.11.18-22',
  //   members: ['김친구', '박친구'],
  //   image: ['/trip-img/trip4.jpeg','/trip-img/trip6.jpeg'],
  // });

  useEffect(() => {
    console.log("Album 페이지 로드/재방문됨.");
    
    if (activeTripId) {
      // 4. localStorage에서 '여행 정보' 불러오기
      const tripInfoKey = `tripInfo_${activeTripId}`;
      const savedTripInfo = JSON.parse(localStorage.getItem(tripInfoKey));
      setActiveTrip(savedTripInfo);

      // 5. localStorage에서 '촬영 횟수' 불러오기
      const countKey = `totalShotCount_${activeTripId}`;
      const savedCount = localStorage.getItem(countKey);
      setActiveShotCount(Number(savedCount) || 0);

      // 6. localStorage에서 '미디어 목록' 불러오기
      const mediaKey = `media_${activeTripId}`;
      const rawMedia = JSON.parse(localStorage.getItem(mediaKey)) || [];
      const validMedia = rawMedia.filter(item => item && item.dataUrl && item.type);
      setActiveMediaList(validMedia);
      
    } else {
      // 7. 활성 여행이 없으면 모든 데이터 초기화
      setActiveTrip(null);
      setActiveShotCount(0);
      setActiveMediaList([]);
    }
  }, [location, activeTripId]); // 8. activeTripId가 바뀔 때마다 실행

  
  const completedTrips = [
    {
      title: '부산 여행',
      startDate: '2024-02-20',
      endDate: '2024-02-23',
      members: ['김친구', '김멋사'],
      count: 24,
      image: ['/trip-img/trip1.jpeg'],
      thumbnail: '/trip-img/trip1.jpeg',
    },
    {
      title: '경주 여행',
      startDate: '2021-03-05',
      endDate: '2021-03-06',
      members: ['최친구', '최멋사', '최이름'],
      count: 24,
      image: ['/trip-img/trip2.jpeg'],
      thumbnail: '/trip-img/trip2.jpeg',
    },
  ];

  // 친구 초대 요청에서 <거절> 클릭 시 동작
  const handleRejectRequest = () => {
    setHasInviteRequest(false);
    alert("친구의 요청을 거절했어요.");
  }

  // 친구 초대 요청에서 <수락> 클릭 시 동작
  const handleAcceptRequest = () => {
    setHasInviteRequest(false);
    if (!activeTrip){
      const newTripId = `${name.replace(/\s/g, '-')}-${new Date().getTime()}`;
      const newTripInfo = {
        id: newTripId,
        title : tripRequest.title,
        startDate : tripRequest.startDate,
        count: 0,
        endDate : tripRequest.endDate,
        members : tripRequest.members,
        coverImage : tripRequest.image || '',
        image: [],
      }

      localStorage.setItem(`tripInfo_${newTripId}`, JSON.stringify(newTripInfo));
      const ids = JSON.parse(localStorage.getItem('tripIds') || '[]');
      localStorage.setItem('tripIds', JSON.stringify([...new Set([...ids, newTripId])]));
      setActiveTrip(newTripInfo);
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
    if (activeTrip){
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
      <Header title={"여행 모아보기"}/>
        <button className='add-trip-btn' onClick={handleCreateBtn}>+</button>
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
        {activeTrip ? <ActiveTrip tripName={activeTrip?.title} members={activeTrip?.members} img={activeTrip?.image} count={activeTrip.count} /> : <></> }

        {/* --- 완료된 여행 섹션 --- */}
        <div className="completed-album">
          <h2 className="section-title">완료된 여행</h2>
          <div className="completed-trips-list">
            {completedTrips.map((trip, index) => (
              <div 
                key = {index}
                className="completed-trip-item">
                <EndedTripItem
                  title={trip.title}
                  startDate={trip.startDate}
                  endDate={trip.endDate}
                  members={trip.members}
                  count={trip.count}
                  image={trip.image}
                />
              </div>
            ))}
          </div> 
        </div>
      </div>
      <Navbar current="albumpage"/>
    </div>
    )
  }


export default Album