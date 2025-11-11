import React from 'react'
import './Navbar.css'
import { useLocation, Link } from 'react-router-dom'

import home_light from '../../assets/home_light.png'
import camera_icon from '../../assets/camera_off.png'
import album_icon from '../../assets/album_off.png'
import mypage_icon from '../../assets/my_off.png'


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
          {/* {locationNow.pathname === "/" ? 
            <img src={home_icon} alt="" className='icon' /> :
            <img src={home_light} alt="" className='icon' />} */}
            <img src={home_light} alt="" className='icon' />

          <p>홈</p>
        </Link>
        <Link to="/camera" className="nav-link">
          {/* {locationNow.pathname.startsWith("/camera") ? 
            <img src={camera_icon} alt="" className='icon' /> :
            <img src={camera_light} alt="" className='icon' />} */}
            <img src={camera_icon} alt="" className='icon' />
          <p>사진촬영</p>
        </Link>
        <Link to="/trips" className="nav-link">
          {/* {locationNow.pathname.startsWith("/album") ? 
            <img src={album_icon} alt="" className='icon' /> :
            <img src={album_light} alt="" className='icon' />} */}
            <img src={album_icon} alt="" className='icon' /> 

          <p>앨범</p>
        </Link>
        <Link to="/mypage" className="nav-link">
          {/* {locationNow.pathname.startsWith("/mypage") ? 
            <img src={mypage_icon} alt="" className='icon' /> :
            <img src={mypage_light} alt="" className='icon' />} */}
            <img src={mypage_icon} alt="" className='icon' /> 
          <p>프로필</p>
        </Link>
      </nav>
    );
  }
}

export default Navbar

