import React from 'react'
import Home from './pages/Home/Home'
import { useEffect } from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom'
import Login from './pages/SignUp/Login';
import StartPage from './pages/SignUp/StartPage';
import Post_Select from './pages/Home/Post/Post_Select';

const App = () => {
  // 스크린 사이즈 세팅
  function setScreenSize() {
		let vh = window.innerHeight * 0.01;
		document.documentElement.style.setProperty('--vh', `${vh}px`);
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
        <Route path='/album' element={<Album/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
