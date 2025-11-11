import React from 'react'
import './Header.css'
import { useLocation, useNavigate } from 'react-router-dom'

const Header = ({title}) => {
  const navigate=useNavigate();
  const locationNow=useLocation();
  
  return (
    <div className='header'>
      <div className='page-name'>{title?title: "트립샷"}</div>
    </div>
  ); 
}
export default Header;

