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
  const [tripId, setTripId] = useState();
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
            picList: picList,
            tripId: tripId
        }
    });
  };

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