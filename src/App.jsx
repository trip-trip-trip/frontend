import React from 'react'
import Home from './pages/Home/Home'
import { useEffect } from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom'
import Login from './pages/SignUp/Login';
import StartPage from './pages/SignUp/StartPage';
import Album from './pages/Album/Album';
import CreateTrip from './pages/Album/CreateTrip';
import TripDetail from './pages/Album/TripDetails/TripDetail';
import VideoDetail from './pages/Album/TripDetails/VideoDetail';
import PhotoDetail from './pages/Album/TripDetails/PhotoDetail';
import PickFrame from './pages/Album/ScrapBook/PickFrame';
import SelectPic from './pages/Album/ScrapBook/SelectPic';
import CreateScrap from './pages/Album/ScrapBook/CreateScrap';
import ProfilePage from './pages/MyPage/ProfilePage';
import FriendListPage from './pages/MyPage/FriendListPage';
import SettingsPage from './pages/MyPage/SettingPage';
import FeedPage from './pages/MyPage/FeedPage';
import CameraPage from './pages/Camera/CameraPage'; // 새로 만들 컴포넌트
import CaptureCompletePage from './pages/Camera/CaptureCompletePage'; 
import AddToHomeScreenPrompt from './components/AddToHomeScreenPrompt';
import PhoneEnter from './pages/SignUp/PhoneEnter';
import CodeVerify from './pages/SignUp/CodeVerify';
import AccountFound from './pages/SignUp/AccountFound';
import SignupWelcome from './pages/SignUp/SignupWelcome'; 
import { AuthProvider } from './contexts/AuthContext';
import ProfileEditPage from './pages/MyPage/ProfileEditPage'; 
import Navbar from './components/NavBar/NavBar';
import PostItem from './pages/Home/post/PostItem';
import PostDetails from './pages/Home/post/PostDetails';
import PostCreate from './pages/Home/post/PostCreate';
import SetUsername from './pages/SignUp/SetUsername';



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
    
       <AuthProvider>
<div className="app-container"> 
   <Routes>
        <Route path='/' element={<StartPage/>}/>
        <Route path='/home' element={<Home/>}/>

        <Route path='/trips' element={<Album/>}/>
        <Route path='/trips/create' element={<CreateTrip/>}/>
        <Route path='/trips/detail' element={<TripDetail/>}/>
        <Route path='/trips/detail/vid' element={<VideoDetail/>}/>
        <Route path='/trips/detail/pic' element={<PhotoDetail/>}/>
        <Route path='/scrapbook/frame' element={<PickFrame/>}/>
        <Route path='/scrapbook/create' element={<SelectPic/>}/>
        <Route path='/scrapbook/complete' element={<CreateScrap/>}/>

      {/*/////////// alua /////////////*/}
        <Route path='/login' element={<Login/>}/>
        <Route path='/StartPage' element={<StartPage/>}/>
        <Route path="/phone" element={<PhoneEnter />} />
        <Route path="/verify" element={<CodeVerify />} />
        <Route path="set-username" element={<SetUsername />} />
        <Route path="/link" element={<AccountFound />} />
        <Route path="/post" element={< PostItem/>} />
        <Route path="/post/:id" element={< PostDetails/>} />
        <Route path="/post/create" element={< PostCreate/>} />


        {/* 프로필 메인 (하단 네비의 “프로필” 버튼 → 여기로 이동) */}
        <Route path="/mypage/profile" element={<ProfilePage />} />
<Route path="/mypage/edit" element={<ProfileEditPage />} />
        {/* 프로필 하위 페이지들 */}
        <Route path="/mypage/friends" element={<FriendListPage />} />
        <Route path="/mypage/settings" element={<SettingsPage />} />
        <Route path="/mypage/feed" element={<FeedPage />} />
        <Route path="/camera/:tripId" element={<CameraPage />} />
        <Route path="/capture-complete/:tripId" element={<CaptureCompletePage />} />
      </Routes>
      {/* <AddToHomeScreenPrompt /> */}
      </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App