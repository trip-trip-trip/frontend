// src/pages/Album/Album.jsx
import React, { useState, useEffect } from 'react'
import './Album.css'
import EndedTripItem from '../../components/Album/EndedTripItem';
import { Link, useLocation } from 'react-router-dom'; 
import Navbar from '../../components/NavBar/NavBar';
import { useAuth } from '../../contexts/AuthContext'; // 1. AuthContext 임포트

const Album = () => {
  const { activeTripId } = useAuth(); // 2. Context에서 활성 ID 가져오기
  
  // 3. 활성 여행의 '정보' (제목, 날짜 등)를 담을 state
  const [activeTrip, setActiveTrip] = useState(null); 
  const [activeShotCount, setActiveShotCount] = useState(0);
  const [activeMediaList, setActiveMediaList] = useState([]);
  
  const location = useLocation();

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
      dateRange: '2024.02.20-23',
      members: 3,
      count: 24,
      image: '/trip-img/trip1.jpeg',
    },
    {
      title: '경주 여행',
      dateRange: '2021.03.05-06',
      members: 3,
      count: 24,
      image: '/trip-img/trip2.jpeg'
    },
  ];

  return (
    <div className='album page-with-nav'> 
      <div className="album-container">
        <h2>활성 여행</h2>
        
        {activeTrip ? ( // 9. activeTrip (정보)이 로드되었는지 확인
          // ID가 있으면: 활성 여행 박스 표시
          <div className="album-box">
            <div className="album-head">
              {/* 10. state의 'title' 사용 */}
              <h3>{activeTrip.title}</h3> 
              <h3>LIVE</h3>
            </div>
            <p>{activeTrip.dateRange}</p>
            
            <div className="album-photo-grid">
              {activeMediaList.map((mediaItem, i) => (
                <div key={mediaItem.id || i} className="photo-preview-item">
                  {mediaItem.type === 'photo' ? (
                    <img src={mediaItem.dataUrl} alt={`미디어 ${i+1}`} />
                  ) : (
                    <video src={mediaItem.dataUrl} muted playsInline /> 
                  )}
                </div>
              ))}
            </div>

            <div className="album-release">
              <p>여행이 끝나면 공개됩니다</p>
              <p className='album-shots'>{activeShotCount} / 24개 촬영 완료</p>
            </div>
            
            <Link to={`/camera/${activeTripId}`} className="go-to-camera-link">
              📸 지금 촬영하러 가기
            </Link>
          </div>
        ) : (
          // ID가 없으면: 플레이스홀더 박스 표시
          <div className="album-box placeholder-box">
            <p>현재 활성화된 여행이 없습니다.</p>
            <Link to="/trips/create">새 여행 만들러 가기</Link>
          </div>
        )}

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
                  dateRange={trip.dateRange}
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