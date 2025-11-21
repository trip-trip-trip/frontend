import React from 'react'
import Header from '../../../components/Header/Header';
import Navbar from '../../../components/NavBar/NavBar';
import './PickFrame.css'
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';

// 프레임 목록 더미
const FrameList = [
  { id: 1, url: '/frame1.PNG', picNum: 4 },
  { id: 2, url: '/frame1.PNG', picNum: 3 },
  { id: 3, url: '/frame1.PNG', picNum: 2 },
  { id: 4, url: '/frame1.PNG', picNum: 4 },
];
const PickFrame = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const picList = location.state?.picList;
  const [completedTrips, setCompletedTrips] = useState([]);
  const todayDate = new Date().toISOString().split('T')[0];
  const [tripData, setTripData] = useState({});
  const API_BASE = import.meta.env.PROD 
      ? (import.meta.env.VITE_API_BASE_URL || 'https://tripshot.duckdns.org') 
      : '/api';
  const [isLoading, setIsLoading] = useState(true); 

  const {token} = useAuth();
  

  // 프레임 선택 핸들러
  const handleFrameSelect = (frameId, picNum, frameUrl) => {
    // 사진 선택 페이지로 이동하면서 선택된 프레임 정보를 state로 전달
    navigate('/scrapbook/create', {
        state: {
            selectedPicNum: picNum,  
            selectedFrameUrl: frameUrl,
            selectedFrameId: frameId,
            picList: picList
        }
    });
  };

  useEffect(() => {
    async function fetchTrips() {
      setIsLoading(true);
      
      if (!token) {
        console.error("인증 토큰(accessToken)이 로컬 스토리지에 없습니다. 로그인 상태를 확인하세요.");
        setIsLoading(false);
        // navigate('/login');
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

        fetchedTrips.forEach(item => {
          const trip = item.trip;
          const contents = item.contents;
          const isCompleted = trip.endDate < todayDate;
          
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

          if (isCompleted) {
            completedList.push(tripData);
          } 
        });

        setCompletedTrips(completedList);

      } catch (error) {
        console.error("Error fetching trips:", error);
      }finally{
        setIsLoading(false);
      }
    }
    fetchTrips();
  }, [token]);

  return (
    <div className='pick-frame'>
        <Header toBack={true}/>
      <div className="frame-container">
        <div className="select-frame-title">
            <p>스크랩북 템플릿을 고르세요</p>
        </div>
        <div className='frame-grid'>
          {FrameList.map((frame)=>(
            <div 
                key={frame.id}
                className='frame-item'
                onClick={() => handleFrameSelect(frame.id, frame.picNum, frame.url)} // 수정된 핸들러 호출
            >
                <img src={frame.url} alt="" />
            </div>
          ))}
        </div>
      </div>
      <Navbar/>
    </div>
  )
}

export default PickFrame