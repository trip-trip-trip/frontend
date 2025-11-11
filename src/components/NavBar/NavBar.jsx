import React from 'react'
import './Navbar.css'
import { useLocation, Link } from 'react-router-dom'

import home_icon from '../../assets/home_off.png'
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
}

export default Navbar

