import React from 'react'
import Home from './pages/Home/Home'
import { useEffect } from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom'
import Login from './pages/SignUp/Login';
import StartPage from './pages/SignUp/StartPage';
import Post_Select from './pages/Home/Post/Post_Select';
import Album from './pages/Album/Album';
import CreateTrip from './pages/Album/CreateTrip';
import TripDetail from './pages/Album/TripDetails/TripDetail';
import VideoDetail from './pages/Album/TripDetails/VideoDetail';
import PhotoDetail from './pages/Album/TripDetails/PhotoDetail';
import PickFrame from './pages/Album/ScrapBook/PickFrame';
import SelectPic from './pages/Album/ScrapBook/SelectPic';
import CreateScrap from './pages/Album/ScrapBook/CreateScrap';

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

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/Login' element={<Login/>}/>
        <Route path='/StartPage' element={<StartPage/>}/>
        <Route path='/post_select' element={<Post_Select/>}/>
        <Route path='/trips' element={<Album/>}/>
        <Route path='/trips/create' element={<CreateTrip/>}/>
        <Route path='/trips/detail' element={<TripDetail/>}/>
        <Route path='/trips/detail/vid' element={<VideoDetail/>}/>
        <Route path='/trips/detail/pic' element={<PhotoDetail/>}/>
        <Route path='/scrapbook/frame' element={<PickFrame/>}/>
        <Route path='/scrapbook/create' element={<SelectPic/>}/>
        <Route path='/scrapbook/complete' element={<CreateScrap/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
