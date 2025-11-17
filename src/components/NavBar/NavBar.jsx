import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './NavBar.css' ;

import home_off from '../../assets/home_off.png'; 
import camera_off from '../../assets/camera_off.png';
import album_off from '../../assets/album_off.png';
import mypage_off from '../../assets/my_off.png';

import home_on from '../../assets/home_on.png'; 
import camera_on from '../../assets/camera_on.png';
import post from '../../assets/upload.png'; 
import album_on from '../../assets/album_on.png';
import mypage_on from '../../assets/my_on.png';


import { useAuth } from '../../contexts/AuthContext'; 

const Navbar = () => {
  const locationNow = useLocation();
  const navigate = useNavigate(); 
  const { activeTripId } = useAuth(); 
  
  const path = locationNow.pathname;

  const handleCameraClick = () => {
    if (activeTripId) {
      navigate(`/camera/${activeTripId}`);
    } else {
      alert('현재 활성화된 여행이 없습니다.');
    }
  };
  
  // 게시물 올리기 (Upload) 핸들러
  const handlePostClick = () => {
    navigate('/trips/create'); 
  }


  if (
    path === "/login" || 
    path === "/StartPage" ||
    path === "/phone" ||
    path === "/verify" ||
    path.startsWith("/camera/") 
   
  ) {
    return null; // 해당 경로에서는 네비게이션 바를 렌더링하지 않음 (숨김 처리)
  }

  return (
    <nav className="navbar">
      
      {/* 1. 홈 (/) */}
      <div className="nav-link" onClick={() => navigate('/home')}>
        <img 
          src={path === '/home' ? home_on : home_off} 
          alt="홈" 
          className='icon' 
        />
        <p className={path === '/home' ? 'active' : ''}>홈</p>
      </div>
      
      {/* 2. 촬영 (카메라) */}
      <div className="nav-link" onClick={handleCameraClick}>
        <img 
          src={path.startsWith('/camera') ? camera_on : camera_off} 
          alt="사진촬영" 
          className='icon' 
        />
        <p className={path.startsWith('/camera') ? 'active' : ''}>촬영</p>
      </div>

      {/* 3. 올리기 (게시물) */}
      <div className="nav-link" onClick={handlePostClick}>
        <img src={post} alt="올리기" className='icon'
        />
      </div>

      {/* 4. 앨범 (/trips) */}
      <div className="nav-link" onClick={() => navigate('/trips')}>
        <img 
          src={path.startsWith('/trips') ? album_on : album_off} 
          alt="앨범" 
          className='icon' 
        /> 
        <p className={path.startsWith('/trips') ? 'active' : ''}>앨범</p>
      </div>

      {/* 5. 프로필 (/mypage/profile) */}
      <div className="nav-link" onClick={() => navigate('/mypage/profile')}>
        <img 
          src={path.startsWith('/mypage') ? mypage_on : mypage_off} 
          alt="프로필" 
          className='icon' 
        /> 
        <p className={path.startsWith('/mypage') ? 'active' : ''}>프로필</p>
      </div>
    </nav>
  );
};

export default Navbar;