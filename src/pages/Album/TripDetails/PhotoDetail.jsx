import React from 'react'
import './PhotoDetail.css'
import Header from '../../../components/Header/Header'
import Navbar from '../../../components/NavBar/NavBar'
import SharedFriends from '../../../components/Album/sharedFriends';

const sharedList = [
  {
    name: '김멋사',
    profile: '/profile-img.png'
  },
  {
    name: '김친구',
    profile: '/profile-img.png'
  },
  {
    name: '이친구',
    profile: '/profile-img.png'
  },
];

const picList = [
  '/trip-img/trip1.jpeg', '/trip-img/trip3.jpeg', '/trip-img/trip4.jpeg', '/trip-img/trip5.jpeg', '/trip-img/trip6.jpeg', '/trip-img/trip7.jpeg', '/trip-img/trip8.jpeg', '/trip-img/trip9.jpeg', '/trip-img/trip10.jpeg', '/trip-img/trip11.jpeg'
];

const PhotoDetail = () => {
  return (
    <div className='photo-detail'>
      <Header title={"사진"}/>
      <div className="photo-detail-container">
        {/* 공유된 친구 정보 */}
        <SharedFriends data={sharedList} />
        <div className='photo-grid'>
            {picList.map((pics)=>(
                <div className='photo-item'>
                    <img src={pics} alt="" />
                </div>
            ))}
          </div>
      </div>
      <Navbar/>
    </div>
  )
}

export default PhotoDetail