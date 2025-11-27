import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './NavBar.css' ;

import home_off from '../../assets/home_off.png'; 
import camera_off from '../../assets/camera_off.png';
import album_off from '../../assets/album_off.png';
import mypage_off from '../../assets/my_off.png';

import home_on from '../../assets/home_on.png'; 
import camera_on from '../../assets/camera_on.png';
import postIcon from '../../assets/upload.png'; 
import album_on from '../../assets/album_on.png';
import mypage_on from '../../assets/my_on.png';


import { useAuth } from '../../contexts/AuthContext'; 
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const Navbar = () => {
  const locationNow = useLocation();
  const navigate = useNavigate(); 
  const { activeTripId, token } = useAuth(); 
  
  const path = locationNow.pathname;

  const [showMenu, setShowMenu] = useState(false);
  // 현재 여행 중인지 여부
  const [isTripActive, setIsTripActive] = useState(false);

  // 메뉴 외부 클릭 시 닫기 위한 로직 =
  useEffect(() => {
    const closeMenu = () => setShowMenu(false);
    if (showMenu) {
      window.addEventListener('click', closeMenu);
    }
    return () => window.removeEventListener('click', closeMenu);
  }, [showMenu]);

  // 여행 상태 확인 API 호출 함수
  const checkActiveTrip = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/trips/isActiveTrips`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.isSuccess) {
        // isOngoing이 true면 여행 중 -> 여행 만들기 비활성화
        setIsTripActive(data.result.isOngoing);
      }
    } catch (e) {
      console.error("여행 상태 확인 실패:", e);
    }
  };

  const handleCameraClick = () => {
    if (activeTripId) {
      navigate(`/camera/${activeTripId}`);
    } else {
      alert('현재 활성화된 여행이 없습니다.');
    }
  };
  
  const handlePostClick = (e) => {
    e.stopPropagation(); // 버블링 방지 (window click 이벤트가 바로 닫아버리는 것 방지)
    
    if (!showMenu) {
      // 메뉴를 열 때 최신 상태 확인
      checkActiveTrip();
    }
    setShowMenu(!showMenu);
  };

  // 메뉴 아이템 클릭 핸들러
  const handleMenuItemClick = (targetPath) => {
    navigate(targetPath);
    setShowMenu(false);
  };
  const handleHomeClick = () => {
    // state로 'feed' 탭을 활성화하라는 신호를 보냄
    navigate('/home', { state: { activeTab: 'feed', timestamp: Date.now() } });
  };


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
<>
    {/* 팝업 메뉴 (Navbar 위에 표시) */}
      {showMenu && (
        <>
            {/* 배경을 누르면 닫히게 하는 투명 레이어 */}
            <div className="menu-overlay" onClick={() => setShowMenu(false)} />
            
            <div className="upload-popup" onClick={(e) => e.stopPropagation()}>
            <button 
                className={`popup-item ${isTripActive ? 'disabled' : ''}`}
                onClick={() => !isTripActive && handleMenuItemClick('/trips/places')}
                disabled={isTripActive}
            >
                여행 만들기
            </button>
            <div className="divider"></div>
            <button 
                className="popup-item"
                onClick={() => handleMenuItemClick('/scrapbook/frame')}
            >
                스크랩북 만들기
            </button>
            <div className="divider"></div>
            <button 
                className="popup-item"
                onClick={() => handleMenuItemClick('/post/create')}
            >
                게시물 올리기
            </button>
            </div>
        </>
      )}

    <nav className="navbar">
      
      <div className="nav-link" onClick={handleHomeClick}>
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
        <img src={postIcon} alt="올리기" className='icon'
        />
        <p> 게시 </p>
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
    </>
  );
};

export default Navbar;