import React from 'react';
import './TripDetail.css';
import SharedFriends from '../../../components/Album/sharedFriends';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Navbar from '../../../components/NavBar/NavBar';
import edit_btn from '/icons/edit_btn.png'
import link_icon from '/icons/link_icon.png'
import album_cont from '/album_cont.png'
import album_cont_vid from '/album_cont_vid.png'
import more_btn from '/icons/more_btn.png'
import { useState } from 'react';
import shared_icon from '/icons/shared_icon.png'

const sharedList = [
    { name: '김멋사',
      profile: '/profile-img.png'},
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
  {url: '/trip-img/trip1.jpeg', isShared: true},
  {url: '/trip-img/trip2.jpeg', isShared: false},
  {url: '/trip-img/trip3.jpeg', isShared: true},
  {url: '/trip-img/trip4.jpeg', isShared: false},
  {url: '/trip-img/trip5.jpeg', isShared: false},
  {url: '/trip-img/trip6.jpeg', isShared: true},
  {url: '/trip-img/trip7.jpeg', isShared: false},
];

const videoList = [
  '/sample_video.MOV',
  'sample_video.MOV',
  'sample_video.MOV',
  'sample_video.MOV',
];

const TripDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showShared, setShowShared] = useState('false');
  const handleToggleShared = (e) => {
    setShowShared(e.target.checked);
  };
    const { 
        title ='',
        startDate = '',
        endDate = '',
        members = [],
        image = [],
    } = location.state || {};

  return (
    <div className='trip-detail'>
      <Header toBack={true}/>
      <div className='trip-detail-container'>
        <h1>{title}</h1> 
        <div className="date-and-edit">
          <h3>{startDate.split('-')} - {endDate.split('-')}</h3>
          <button className='edit-btn'><img src={edit_btn} alt="" /></button>
        </div>

        {/* 공유된 친구 정보 & 공유 사진 관리 버튼*/}
        <div className="shared-cont">
          <div className="shared-friend">
            <SharedFriends data={sharedList} />
          </div>
          <button className='share-btn'>
            <img src={link_icon} alt="" />
            <p>공유 사진 관리하기</p>
          </button>
        </div>
        <div className="display-shared">
          <input type="checkbox" 
            className='display-checked'
            checked={showShared}
            onChange={handleToggleShared}
          />
          <p>공유된 미디어 표시</p>
        </div>

        {/* 사진 섹션 */}
          <div className="photo_container">
            <img src={album_cont} alt="" className='album-cont-img' />
            <div className='section-photo-header'>
              <h2 className='photo-cont-title'>사진</h2>
              <button className='more-photo-button' onClick={()=>navigate('/trips/detail/pic', {state: { picList : picList } } )}>
                <img src={more_btn} alt="" />
              </button>
            </div>
            <div className="photo-grid-cont">
              <div className='photo-grid'>
                {picList.map((pics, index)=>(
                  <div className='photo-item' key={index}> 
                      <img src={pics.url} alt="" />
                      {showShared && pics.isShared && (
                        <div className='shared-link-icon'>
                          <img src={shared_icon} alt="공유됨" />
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button className='scrapbook-btn' onClick={()=>navigate('/scrapbook/frame')}>
            <h1>스크랩북 만들기</h1>
          </button>


          {/* video 섹션 */}
          <div className="video_container">
            <img src={album_cont_vid} alt="" className='album-cont-vid' />
            <div className='section-video-header'>
              <h2 className='video-cont-title'>3초 영상</h2>
              <button className='more-video-button' onClick={()=>navigate('/trips/detail/pic')}>
                <img src={more_btn} alt="" />
              </button>
            </div>
            <div className="video-grid-cont">
              <div className='video-grid'>
              <div className='video-card video-main'>

              </div>
              <div className='video-card'></div>
              <div className='video-card'></div>
              <div className='video-card'></div>
              <div className='video-card'></div>
                </div>
            </div>
          </div>
      </div>
      <Navbar/>
    </div>
  );
};

export default TripDetail;
