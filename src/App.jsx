import React from 'react'
import Home from './pages/Home/Home'
import { useEffect } from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom'
import ProfilePage from './pages/MyPage/ProfilePage';
import FriendListPage from './pages/MyPage/FriendListPage';
import SettingsPage from './pages/MyPage/SettingPage';
import FeedPage from './pages/MyPage/FeedPage';
import CameraPage from './pages/Camera/CameraPage'; // 새로 만들 컴포넌트
import CaptureCompletePage from './pages/Camera/CaptureCompletePage'; 

const App = () => {
  // 스크린 사이즈 세팅
  function setScreenSize() {
		let dvh = window.innerHeight * 0.01;
		document.documentElement.style.setProperty('--dvh', `${dvh}px`);
	}

  useEffect(() => {
		setScreenSize();

		const handleResize = () => {
			setScreenSize();
		};

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);

   useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => console.log('✅ Service Worker 등록 완료:', reg))
          .catch((err) => console.error('❌ 등록 실패:', err));
      });
    }
  }, []);
  
  return (
    <BrowserRouter>
    
        
<div className="app-container"> 
   <Routes>
        <Route path='/' element={<Home/>}/>
		  {/* 프로필 메인 (하단 네비의 “프로필” 버튼 → 여기로 이동) */}
        <Route path="/mypage/profile" element={<ProfilePage />} />

        {/* 프로필 하위 페이지들 */}
        <Route path="/mypage/friends" element={<FriendListPage />} />
        <Route path="/mypage/settings" element={<SettingsPage />} />
        <Route path="/mypage/feed" element={<FeedPage />} />
        <Route path="./mypage/settings" element={<SettingsPage />} />
      , <Route path="/camera" element={<CameraPage />} />
        <Route path="/capture-complete" element={<CaptureCompletePage />} />

      </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
