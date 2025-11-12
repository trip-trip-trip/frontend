// src/components/NavBar/NavBar.jsx
import React from 'react';
// 👇 1. [수정] Link 대신 useNavigate, useLocation 임포트
import { useLocation, useNavigate } from 'react-router-dom';
import './NavBar.css' ;

import home_light from '../../assets/home_off.png'; // (아이콘 경로는 assets에서 맞게)
import camera_icon from '../../assets/camera_off.png';
import album_icon from '../../assets/album_off.png';
import mypage_icon from '../../assets/my_off.png';
import { useAuth } from '../../contexts/AuthContext'; // 2. AuthContext 임포트

const Navbar = () => {
  const locationNow = useLocation();
  const navigate = useNavigate(); // 3. navigate 훅 사용
  const { activeTripId } = useAuth(); // 4. AuthContext에서 활성 ID 가져오기

  // 5. 카메라 버튼 클릭 핸들러
  const handleCameraClick = () => {
    if (activeTripId) {
      // 6. 활성 ID가 있으면 카메라 페이지로 이동
      navigate(`/camera/${activeTripId}`);
    } else {
      // 7. 활성 ID가 없으면 모달(알림) 띄우기
      alert('현재 활성화된 여행이 없습니다.');
    }
  };

  // 8. [수정] Navbar를 숨길 모든 경로 확인
  if (
    locationNow.pathname === "/login" || 
    locationNow.pathname === "/StartPage" ||
    locationNow.pathname === "/phone" ||
    locationNow.pathname === "/verify" ||
    locationNow.pathname.startsWith("/camera/") // (카메라 페이지에서도 숨김)
  ) {
    return null; 
  }

  return (
    <nav className="navbar">
      {/* 👇 9. [수정] 모든 <Link> 태그를 <div onClick>으로 변경 */}
      <div className="nav-link" onClick={() => navigate('/')}>
        <img src={home_light} alt="홈" className='icon' />
        <p>홈</p>
      </div>
      
      {/* 👇 10. [핵심 수정] onClick에 handleCameraClick 연결 */}
      <div className="nav-link" onClick={handleCameraClick}>
        <img src={camera_icon} alt="사진촬영" className='icon' />
        <p>사진촬영</p>
      </div>

      {/* 👇 11. [수정] /trips 경로로 수정 */}
      <div className="nav-link" onClick={() => navigate('/trips')}>
        <img src={album_icon} alt="앨범" className='icon' /> 
        <p>앨범</p>
      </div>
      
      {/* 👇 12. [수정] /mypage/profile 경로로 수정 */}
      <div className="nav-link" onClick={() => navigate('/mypage/profile')}>
        <img src={mypage_icon} alt="프로필" className='icon' /> 
        <p>프로필</p>
      </div>
    </nav>
  );
}

export default Navbar;