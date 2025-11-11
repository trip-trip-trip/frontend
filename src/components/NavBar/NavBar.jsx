import React from 'react';
// 👇 1. useNavigate와 Link 제거 (useLocation만 남김)
import { useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

import home_icon from '../../assets/home_off.png'
import camera_icon from '../../assets/camera_off.png'
import album_icon from '../../assets/album_off.png'
import mypage_icon from '../../assets/my_off.png'
import { useAuth } from '../../contexts/AuthContext'; // 2. AuthContext 임포트

const Navbar = () => {
  const locationNow = useLocation();

  if (
    locationNow.pathname === "/login" 
  ) {
    return null; // navbar 숨김
  } else {
    return (
      <nav className="navbar">
        <Link to="/" className="nav-link">
            <img src={home_icon} alt="" className='icon' />
          <p>홈</p>
        </Link>
        <Link to="/camera" className="nav-link">
            <img src={camera_icon} alt="" className='icon' />
          <p>사진촬영</p>
        </Link>
        <Link to="/album" className="nav-link">
            <img src={album_icon} alt="" className='icon' /> 
          <p>앨범</p>
        </Link>
        <Link to="/mypage" className="nav-link">
            <img src={mypage_icon} alt="" className='icon' /> 
          <p>프로필</p>
        </Link>
      </nav>
    );
  }
  const navigate = useNavigate(); // 3. navigate 훅 사용
  const { activeTripId } = useAuth(); // 4. AuthContext에서 활성 ID 가져오기

  // 5. 카메라 버튼 클릭 핸들러 (새로 추가)
  const handleCameraClick = () => {
    if (activeTripId) {
      // 6. 활성 ID가 있으면 카메라 페이지로 이동
      navigate(`/camera/${activeTripId}`);
    } else {
      // 7. 활성 ID가 없으면 모달(알림) 띄우기
      alert('현재 활성화된 여행이 없습니다.');
      // (나중에 예쁜 모달 컴포넌트로 교체하면 됩니다)
    }
  };

  // 로그인 페이지 등에서는 Navbar 숨김
  if (locationNow.pathname === "/login" || locationNow.pathname === "/StartPage") {
    return null; 
  }

  return (
    <nav className="navbar">
      {/* 👇 8. <Link> 태그를 <div onClick>으로 변경 */}
      <div className="nav-link" onClick={() => navigate('/')}>
        <img src={home_light} alt="홈" className='icon' />
        <p>홈</p>
      </div>
      
      {/* 👇 9. [핵심 수정] <Link> -> <div onClick={handleCameraClick}> */}
      <div className="nav-link" onClick={handleCameraClick}>
        <img src={camera_icon} alt="사진촬영" className='icon' />
        <p>사진촬영</p>
      </div>

      {/* 👇 10. <Link> -> <div onClick> (App.jsx의 /trips 경로로 수정) */}
      <div className="nav-link" onClick={() => navigate('/trips')}>
        <img src={album_icon} alt="앨범" className='icon' /> 
        <p>앨범</p>
      </div>
      
      {/* 👇 11. <Link> -> <div onClick> */}
      <div className="nav-link" onClick={() => navigate('/mypage/profile')}>
        <img src={mypage_icon} alt="프로필" className='icon' /> 
        <p>프로필</p>
      </div>
    </nav>
  );
}

export default Navbar;
